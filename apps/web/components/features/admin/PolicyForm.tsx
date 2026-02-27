'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { CreatePolicySchema, PolicyTheme, PolicyStatus, SenegalRegion } from '@xamle/types';
import type { CreatePolicyDto, Policy, Ministry } from '@xamle/types';
import { Button, Input, Card, CardContent } from '@xamle/ui';
import { api, fetchMinistries } from '@/lib/api';

interface PolicyFormProps {
  policy?: Policy;
  mode: 'create' | 'edit';
}

export function PolicyForm({ policy, mode }: PolicyFormProps) {
  const router = useRouter();
  const tStatus = useTranslations('status');
  const tTheme = useTranslations('theme');
  const tRegion = useTranslations('region');

  const { data: ministries = [] } = useQuery({
    queryKey: ['ministries'],
    queryFn: fetchMinistries,
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreatePolicyDto>({
    resolver: zodResolver(CreatePolicySchema),
    defaultValues: policy ? {
      title: policy.title,
      description: policy.description,
      ministryId: policy.ministryId,
      theme: policy.theme,
      status: policy.status,
      budget: policy.budget ?? undefined,
      budgetSpent: policy.budgetSpent ?? undefined,
      startDate: policy.startDate ? new Date(policy.startDate).toISOString().slice(0, 16) : undefined,
      endDate: policy.endDate ? new Date(policy.endDate).toISOString().slice(0, 16) : undefined,
      targetKpis: policy.targetKpis || [],
      region: policy.region ?? undefined,
    } : {
      status: PolicyStatus.NOT_STARTED,
      targetKpis: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'targetKpis',
  });

  const mutation = useMutation({
    mutationFn: (data: CreatePolicyDto) => {
      if (mode === 'edit' && policy) {
        return api.patch<Policy>(`/policies/${policy.id}`, data);
      }
      return api.post<Policy>('/policies', data);
    },
    onSuccess: () => {
      router.push('/admin/policies');
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold">Informations générales</h2>

          <div>
            <label htmlFor="title" className="text-sm font-medium mb-1.5 block">
              Titre <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Ex: Programme de modernisation de l'agriculture"
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium mb-1.5 block">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full min-h-[150px] px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrivez la politique publique en détail..."
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ministryId" className="text-sm font-medium mb-1.5 block">
                Ministère <span className="text-destructive">*</span>
              </label>
              <select
                id="ministryId"
                {...register('ministryId')}
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sélectionner un ministère</option>
                {ministries.map((m: Ministry) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {errors.ministryId && (
                <p className="text-sm text-destructive mt-1">{errors.ministryId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="theme" className="text-sm font-medium mb-1.5 block">
                Thème <span className="text-destructive">*</span>
              </label>
              <select
                id="theme"
                {...register('theme')}
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sélectionner un thème</option>
                {Object.values(PolicyTheme).map((theme) => (
                  <option key={theme} value={theme}>{tTheme(theme)}</option>
                ))}
              </select>
              {errors.theme && (
                <p className="text-sm text-destructive mt-1">{errors.theme.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="text-sm font-medium mb-1.5 block">
                Statut
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.values(PolicyStatus).map((status) => (
                  <option key={status} value={status}>{tStatus(status)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="region" className="text-sm font-medium mb-1.5 block">
                Région
              </label>
              <select
                id="region"
                {...register('region')}
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Toutes les régions</option>
                {Object.values(SenegalRegion).map((region) => (
                  <option key={region} value={region}>{tRegion(region)}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-lg font-semibold">Budget et calendrier</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="text-sm font-medium mb-1.5 block">
                Budget total (FCFA)
              </label>
              <Input
                id="budget"
                type="number"
                step="1000000"
                {...register('budget', { valueAsNumber: true })}
                error={errors.budget?.message}
                placeholder="Ex: 5000000000"
              />
            </div>

            <div>
              <label htmlFor="budgetSpent" className="text-sm font-medium mb-1.5 block">
                Budget dépensé (FCFA)
              </label>
              <Input
                id="budgetSpent"
                type="number"
                step="1000000"
                {...register('budgetSpent', { valueAsNumber: true })}
                error={errors.budgetSpent?.message}
                placeholder="Ex: 1500000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="text-sm font-medium mb-1.5 block">
                Date de début
              </label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
                error={errors.startDate?.message}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="text-sm font-medium mb-1.5 block">
                Date de fin
              </label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
                error={errors.endDate?.message}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Indicateurs de performance (KPIs)</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ name: '', target: 0, current: 0, unit: '' })}
            >
              <Plus className="h-4 w-4 mr-1.5" />Ajouter un KPI
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun indicateur défini</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="border border-border rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">KPI #{index + 1}</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">
                    Nom de l'indicateur
                  </label>
                  <Input
                    {...register(`targetKpis.${index}.name`)}
                    placeholder="Ex: Nombre de bénéficiaires"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Objectif
                  </label>
                  <Input
                    type="number"
                    {...register(`targetKpis.${index}.target`, { valueAsNumber: true })}
                    placeholder="Ex: 10000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Valeur actuelle
                  </label>
                  <Input
                    type="number"
                    {...register(`targetKpis.${index}.current`, { valueAsNumber: true })}
                    placeholder="Ex: 3500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Unité
                  </label>
                  <Input
                    {...register(`targetKpis.${index}.unit`)}
                    placeholder="Ex: personnes, km, écoles"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {mutation.isError && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">
            {(mutation.error as Error).message || 'Une erreur est survenue'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={mutation.isPending}>
          {mode === 'create' ? 'Créer la politique' : 'Enregistrer les modifications'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
