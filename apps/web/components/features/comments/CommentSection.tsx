'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchComments, createComment } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@xamle/ui';
import { MessageSquare, Reply } from 'lucide-react';
import { UserLevel } from '@xamle/types';

const LEVEL_COLORS: Record<UserLevel, string> = {
  [UserLevel.OBSERVER]: 'bg-gray-100 text-gray-600',
  [UserLevel.CONTRIBUTOR]: 'bg-blue-100 text-blue-700',
  [UserLevel.EXPERT]: 'bg-amber-100 text-amber-700',
  [UserLevel.AMBASSADOR]: 'bg-civic-red/10 text-civic-red',
};

const schema = z.object({ body: z.string().min(3).max(2000) });

export function CommentSection({ policyId }: { policyId: string }) {
  const { isAuthenticated } = useUserStore();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', policyId],
    queryFn: () => fetchComments(policyId),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: string) =>
      createComment({ policyId, parentId: replyTo ?? undefined, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', policyId] });
      reset();
      setReplyTo(null);
    },
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-civic-red" />
            Commentaires ({data?.meta.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated() ? (
            <form onSubmit={handleSubmit((d) => mutation.mutate(d.body))} className="space-y-3">
              <textarea
                {...register('body')}
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-civic-red"
                placeholder={replyTo ? 'Répondre au commentaire...' : 'Partagez votre point de vue...'}
                aria-label="Votre commentaire"
              />
              {errors.body && <p className="text-xs text-destructive">{String(errors.body.message)}</p>}
              <div className="flex items-center gap-2">
                <Button type="submit" loading={mutation.isPending} size="sm">
                  Publier
                </Button>
                {replyTo && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <a href="/auth/login" className="text-civic-red hover:underline">Connectez-vous</a> pour commenter.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {data?.data.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentItem
              comment={comment}
              onReply={() => setReplyTo(comment.id)}
              showReply={isAuthenticated()}
            />
            {comment.children?.map((child) => (
              <div key={child.id} className="ml-8 border-l-2 border-border pl-4">
                <CommentItem comment={child} showReply={false} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  showReply = true,
}: {
  comment: import('@xamle/types').Comment;
  onReply?: () => void;
  showReply?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0"
        aria-hidden="true"
      >
        {comment.user?.name?.[0] ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.user?.name}</span>
          {comment.user?.level && (
            <span className={`text-xs rounded-full px-2 py-0.5 ${LEVEL_COLORS[comment.user.level as UserLevel]}`}>
              {comment.user.level}
            </span>
          )}
          <time dateTime={comment.createdAt} className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </time>
        </div>
        <p className="text-sm text-foreground">{comment.body}</p>
        {showReply && onReply && (
          <button
            onClick={onReply}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-civic-red transition-colors"
          >
            <Reply className="h-3 w-3" aria-hidden="true" />
            Répondre
          </button>
        )}
      </div>
    </div>
  );
}
