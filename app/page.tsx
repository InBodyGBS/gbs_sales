import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BarChart3, Database, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Upload,
      title: 'Easy Data Upload',
      description: 'Upload Excel files for each entity with drag-and-drop interface',
    },
    {
      icon: Database,
      title: 'Centralized Data',
      description: 'All sales data from 6 entities in one unified platform',
    },
    {
      icon: BarChart3,
      title: 'Rich Visualizations',
      description: 'Interactive charts and graphs for comprehensive analysis',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Insights',
      description: 'Get instant insights with powerful filtering and analytics',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold">
            Sales Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            통합 매출 분석 대시보드 - InBody 글로벌 자회사 매출 데이터를 한 곳에서 관리하고 분석하세요
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/upload">
            <Button size="lg" className="w-full sm:w-auto">
              <Upload className="h-5 w-5 mr-2" />
              Upload Data
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Supporting entities: HQ, USA, BWA, Vietnam, Healthcare, Korot</p>
        </div>
      </div>
    </div>
  );
}
