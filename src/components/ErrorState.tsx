import React from 'react';
import { XCircleIcon } from './icons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Unable to Load Data',
  message,
  onRetry 
}) => {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
      <Card className="max-w-md mx-auto border-destructive/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <XCircleIcon className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-destructive mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

