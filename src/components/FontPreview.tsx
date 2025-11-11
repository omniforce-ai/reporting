'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon } from '@/components/icons';

interface FontInfo {
  name: string;
  family: string;
  source: string;
  type: 'Variable' | 'Static';
  cost: 'Free' | 'Paid';
  url?: string;
  loadUrl?: string;
  characteristics: string[];
  bestFor: string;
  suitability: 'Excellent' | 'Good' | 'Fair';
  rating: number;
}

const fonts: FontInfo[] = [
  {
    name: 'Inter Variable',
    family: 'Inter Variable',
    source: 'Google Fonts',
    type: 'Variable',
    cost: 'Free',
    url: 'https://rsms.me/inter/',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    characteristics: ['Modern geometric sans-serif', 'Optimized for screens', 'Variable font', 'Excellent readability'],
    bestFor: 'Primary brand font, UI elements, body text',
    suitability: 'Excellent',
    rating: 5,
  },
  {
    name: 'Geist',
    family: 'Geist, system-ui, sans-serif',
    source: 'Vercel',
    type: 'Variable',
    cost: 'Free',
    url: 'https://vercel.com/font',
    loadUrl: undefined,
    characteristics: ['Clean, professional aesthetic', 'Similar to Inter but more refined', 'Excellent for data-heavy interfaces'],
    bestFor: 'Modern tech brand, dashboards, UI',
    suitability: 'Excellent',
    rating: 5,
  },
  {
    name: 'Plus Jakarta Sans',
    family: 'Plus Jakarta Sans',
    source: 'Google Fonts',
    type: 'Static',
    cost: 'Free',
    url: 'https://fonts.google.com/specimen/Plus+Jakarta+Sans',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap',
    characteristics: ['Contemporary geometric sans-serif', 'High readability', 'Professional yet approachable'],
    bestFor: 'Headings, brand identity, marketing materials',
    suitability: 'Excellent',
    rating: 5,
  },
  {
    name: 'Roboto',
    family: 'Roboto',
    source: 'Google Fonts',
    type: 'Static',
    cost: 'Free',
    url: 'https://fonts.google.com/specimen/Roboto',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap',
    characteristics: ['Clean lines and geometric shapes', 'Futuristic charm', 'Excellent screen readability'],
    bestFor: 'UI elements, digital-first branding',
    suitability: 'Good',
    rating: 4,
  },
  {
    name: 'Manrope',
    family: 'Manrope',
    source: 'Google Fonts',
    type: 'Static',
    cost: 'Free',
    url: 'https://fonts.google.com/specimen/Manrope',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap',
    characteristics: ['Rounded terminals (friendly feel)', 'Professional appearance', 'Works for headings and body'],
    bestFor: 'Brand identity, marketing, UI',
    suitability: 'Good',
    rating: 4,
  },
  {
    name: 'Work Sans',
    family: 'Work Sans',
    source: 'Google Fonts',
    type: 'Static',
    cost: 'Free',
    url: 'https://fonts.google.com/specimen/Work+Sans',
    loadUrl: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap',
    characteristics: ['Optimized for screens', '9 weights available', 'Grotesque style'],
    bestFor: 'Data visualization, charts',
    suitability: 'Good',
    rating: 4,
  },
  {
    name: 'DM Sans',
    family: 'DM Sans',
    source: 'Google Fonts',
    type: 'Static',
    cost: 'Free',
    url: 'https://fonts.google.com/specimen/DM+Sans',
    loadUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap',
    characteristics: ['Clean, modern', 'High x-height', 'Excellent number readability'],
    bestFor: 'Financial/analytics dashboards',
    suitability: 'Good',
    rating: 4,
  },
];

export default function FontPreview() {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fonts.forEach((font) => {
      if (font.loadUrl && !loadedFonts.has(font.family)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.loadUrl;
        link.onload = () => {
          setLoadedFonts((prev) => new Set(prev).add(font.family));
        };
        document.head.appendChild(link);
      } else if (!font.loadUrl && !loadedFonts.has(font.family)) {
        setLoadedFonts((prev) => new Set(prev).add(font.family));
      }
    });
  }, []);

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'Excellent':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'Good':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Font Recommendations for AI Automation Agency</h2>
        <p className="text-muted-foreground">
          Preview and evaluate modern fonts suitable for your application. Each font is displayed in various sizes and weights to help you assess suitability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fonts.map((font) => (
          <Card key={font.name} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle style={{ fontFamily: font.family }} className="text-2xl mb-2">
                    {font.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{font.type}</Badge>
                    <Badge variant="outline">{font.cost}</Badge>
                    <Badge className={getSuitabilityColor(font.suitability)}>
                      {font.suitability}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {renderStars(font.rating)}
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                <strong>Source:</strong> {font.source}
                {font.url && (
                  <a
                    href={font.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline"
                  >
                    View →
                  </a>
                )}
                {!font.loadUrl && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Requires manual installation)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Font Preview Samples */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                <div style={{ fontFamily: font.family, fontSize: '32px', fontWeight: 700 }}>
                  Heading 1 - Bold
                </div>
                <div style={{ fontFamily: font.family, fontSize: '24px', fontWeight: 600 }}>
                  Heading 2 - Semibold
                </div>
                <div style={{ fontFamily: font.family, fontSize: '18px', fontWeight: 500 }}>
                  Heading 3 - Medium
                </div>
                <div style={{ fontFamily: font.family, fontSize: '16px', fontWeight: 400 }}>
                  Body text - Regular. The quick brown fox jumps over the lazy dog. 1234567890
                </div>
                <div style={{ fontFamily: font.family, fontSize: '14px', fontWeight: 400 }}>
                  Small text - Regular. Perfect for labels and captions.
                </div>
                <div style={{ fontFamily: font.family, fontSize: '48px', fontWeight: 700 }}>
                  1,234
                </div>
                <div style={{ fontFamily: font.family, fontSize: '14px', fontWeight: 400 }}>
                  Metrics: +12.5% ↑ | $45,678 | 99.9%
                </div>
              </div>

              {/* Characteristics */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Characteristics:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {font.characteristics.map((char, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best For */}
              <div>
                <h4 className="text-sm font-semibold mb-1">Best For:</h4>
                <p className="text-sm text-muted-foreground">{font.bestFor}</p>
              </div>

              {/* Suitability Assessment */}
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {font.suitability === 'Excellent' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <span className="text-sm font-semibold">Suitability for App:</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {font.suitability === 'Excellent' && 'Highly recommended for use in the application. Excellent readability and modern aesthetic.'}
                  {font.suitability === 'Good' && 'Good option with solid performance and readability. Consider for specific use cases.'}
                  {font.suitability === 'Fair' && 'Decent option but may have limitations. Evaluate carefully for your specific needs.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Font Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Font Setup</CardTitle>
          <CardDescription>
            Your application currently uses Inter Variable as the primary font
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium">Inter Variable</span>
              <Badge variant="outline">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground ml-7">
              This is an excellent choice for your AI automation agency. It's modern, highly readable, and optimized for digital interfaces.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Keep Current Setup</h4>
            <p className="text-sm text-muted-foreground">
              Inter Variable is already an excellent choice. Consider keeping it as your primary font.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Alternative Options</h4>
            <p className="text-sm text-muted-foreground">
              If you want to refresh the brand, <strong>Geist</strong> offers a similar aesthetic with more refinement. 
              <strong>Plus Jakarta Sans</strong> works well for headings and marketing materials.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Font Pairing</h4>
            <p className="text-sm text-muted-foreground">
              Consider pairing your primary font with <strong>Plus Jakarta Sans</strong> for headings to create visual hierarchy while maintaining consistency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

