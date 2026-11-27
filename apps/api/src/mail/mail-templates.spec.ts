import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { MailService } from './mail.service';

const email = 'cosplayer.long.name+preview@example.com';
const url =
  'https://api.crodic.click/api/v1/user/auth/verify/email?token=preview-only&from=email';
const fixtures = [
  ['email-verification', { email, url }],
  ['user-email-verification', { email, url }],
  ['admin-email-verification', { email, url }],
  ['email-reset-password', { email, url }],
  ['user-email-reset-password', { email, url }],
  ['admin-email-reset-password', { email, url }],
  ['user-email-restore', { email, url }],
  [
    'admin-account-deletion-requested',
    { adminName: 'Nguyễn An', deletionDate: '27/12/2026' },
  ],
  [
    'admin-account-hard-deleted',
    { adminName: 'Nguyễn An', deletedAt: '27/11/2026' },
  ],
  [
    'admin-account-hard-deleted-report',
    { adminName: 'Nguyễn An', deletedCount: 12 },
  ],
  [
    'admin-pending-posts-digest',
    { currentDate: '27/11/2026', pendingCount: 18, reviewUrl: url },
  ],
] as const;

describe('Kosume production mail templates', () => {
  const transport = { sendMail: jest.fn() };
  const service = new MailService(
    new ConfigService<AllConfigType>(),
    transport as unknown as MailerService,
  );

  it.each(fixtures)(
    'renders %s with its existing context contract',
    (name, context) => {
      const html = service.renderTemplate(name, context);
      expect(html).toMatch(/^<!DOCTYPE html>/);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).toContain('lang="vi"');
      expect(html).toContain('Kosume');
      expect(html).not.toContain('{{');
      expect(html).not.toContain('Crodic Portal');
      expect(html).not.toContain('box-shadow');
      for (const value of Object.values(context)) {
        expect(html).toContain(
          String(value).replaceAll('&', '&amp;').replaceAll('=', '&#x3D;'),
        );
      }
      expect(Buffer.byteLength(html, 'utf8')).toBeLessThan(20_000);
    },
  );

  it.each(
    fixtures.filter(
      ([, context]) => 'url' in context || 'reviewUrl' in context,
    ),
  )(
    'keeps the primary action and fallback destination identical for %s',
    (name, context) => {
      const html = service.renderTemplate(name, context);
      const destinations = Array.from(
        html.matchAll(/href="([^"]+)"/g),
        (match) => match[1],
      );
      const expected = url.replaceAll('&', '&amp;').replaceAll('=', '&#x3D;');
      expect(destinations.filter((href) => href === expected)).toHaveLength(2);
    },
  );

  it('uses an optional caller-provided logo without losing the Kosume wordmark', () => {
    const html = service.renderTemplate('admin-account-deletion-requested', {
      adminName: 'An',
      deletionDate: '27/12/2026',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
    expect(html).toContain('src="https://cdn.example.com/logo.png"');
    expect(html).toContain('>Kosume</a>');
  });

  it('escapes user-controlled text and does not leak context between renders', () => {
    const first = service.renderTemplate('user-email-verification', {
      email: '<script>alert(1)</script>',
      url,
    });
    const second = service.renderTemplate('user-email-verification', {
      email: 'another@example.com',
      url,
    });
    expect(first).not.toContain('<script>');
    expect(first).toContain('&lt;script&gt;');
    expect(second).toContain('another@example.com');
    expect(second).not.toContain('alert(1)');
    expect(transport.sendMail).not.toHaveBeenCalled();
  });

  it('preserves zero counts instead of hiding the report value', () => {
    const html = service.renderTemplate('admin-account-hard-deleted-report', {
      adminName: 'An',
      deletedCount: 0,
    });
    expect(html).toContain('0 tài khoản quản trị');
  });
});
