import { NewsletterThemeWrapper } from '@/components/NewsletterThemeWrapper';

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return <NewsletterThemeWrapper>{children}</NewsletterThemeWrapper>;
}
