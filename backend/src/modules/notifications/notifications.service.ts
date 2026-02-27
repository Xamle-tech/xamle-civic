import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get('SMTP_SECURE') === 'true',
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM', '"Xamle Civic" <noreply@xamle.sn>'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (e) {
      this.logger.warn(`Email failed to ${to}: ${e}`);
    }
  }

  async notifyPolicyUpdate(policyId: string, update: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { policyId, channels: { has: 'EMAIL' } },
      include: {
        user: { select: { email: true, name: true } },
        policy: { select: { title: true, slug: true } },
      },
    });

    const notifications = subscriptions.map((sub) =>
      this.sendEmail(
        sub.user.email,
        `[Xamle Civic] Mise à jour : ${sub.policy.title}`,
        `
        <h2>Mise à jour de politique publique</h2>
        <p>Bonjour ${sub.user.name},</p>
        <p>La politique <strong>${sub.policy.title}</strong> a été mise à jour :</p>
        <p>${update}</p>
        <a href="${this.config.get('APP_URL')}/policies/${sub.policy.slug}">Voir la fiche</a>
        <hr>
        <small><a href="${this.config.get('APP_URL')}/me/subscriptions">Se désabonner</a></small>
        `,
      ),
    );

    await Promise.allSettled(notifications);
    this.logger.log(`Notifications sent for policy ${policyId} to ${subscriptions.length} subscribers`);
  }

  async createInAppNotification(userId: string, type: string, title: string, body: string, metadata?: object) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        channel: 'IN_APP',
        metadata: (metadata ?? {}) as object,
      },
    });
  }
}
