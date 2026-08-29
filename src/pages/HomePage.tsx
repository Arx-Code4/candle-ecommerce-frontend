import { useProducts } from '@/hooks/useProducts';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesBanner } from '@/components/home/FeaturesBanner';
import { FeaturedCandlesSection } from '@/components/home/FeaturedCandlesSection';

import { WhyLoveLumiereSection } from '@/components/home/WhyLoveLumiereSection';
import { FillYourSpaceSection } from '@/components/home/FillYourSpaceSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { ShippingBanner } from '@/components/home/ShippingBanner';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useProducts({ limit: 8 });

  return (
    <div className="w-full flex flex-col">
      <HeroSection />
      <FeaturesBanner />
      <FeaturedCandlesSection
        products={data?.items || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
      <WhyLoveLumiereSection />
      <FillYourSpaceSection />
      <TestimonialsSection />
      <ShippingBanner />
      <NewsletterSection />
    </div>
  );
}
