"use client"

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Campaign {
  name: string;
  emailsSent: number;
  openRate?: number;
  clickRate?: number;
  replyRate: number;
  status?: string;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  title?: string;
  description?: string;
}

export default function CampaignsTable({ 
  campaigns, 
  title = 'Campaigns',
  description = 'Performance metrics for all campaigns'
}: CampaignsTableProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No campaigns found.</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => num.toLocaleString('en-US');
  const formatPercentage = (num: number) => num.toFixed(1);

  // Sort campaigns: active first, then by name
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aIsActive = a.status === 'ACTIVE' || a.status === 'active' || a.status === 'running';
    const bIsActive = b.status === 'ACTIVE' || b.status === 'active' || b.status === 'running';
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead className="text-right">Emails Sent</TableHead>
              {campaigns.some(c => c.openRate !== undefined) && (
                <TableHead className="text-right">Open Rate</TableHead>
              )}
              {campaigns.some(c => c.clickRate !== undefined) && (
                <TableHead className="text-right">Click Rate</TableHead>
              )}
              <TableHead className="text-right">Reply Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.map((campaign, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="text-right">{formatNumber(campaign.emailsSent)}</TableCell>
                {campaigns.some(c => c.openRate !== undefined) && (
                  <TableCell className="text-right">
                    {campaign.openRate !== undefined ? `${formatPercentage(campaign.openRate)}%` : '-'}
                  </TableCell>
                )}
                {campaigns.some(c => c.clickRate !== undefined) && (
                  <TableCell className="text-right">
                    {campaign.clickRate !== undefined ? `${formatPercentage(campaign.clickRate)}%` : '-'}
                  </TableCell>
                )}
                <TableCell className="text-right">{formatPercentage(campaign.replyRate)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

