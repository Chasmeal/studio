"use client";

import type { Project } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Users, Palette } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

// Predefined colors for selection. In a real app, this could be more sophisticated.
export const projectColors: { name: string; value: string; className: string }[] = [
  { name: 'Blue', value: '#3498db', className: 'bg-[#3498db]' },
  { name: 'Green', value: '#2ecc71', className: 'bg-[#2ecc71]' },
  { name: 'Purple', value: '#9b59b6', className: 'bg-[#9b59b6]' },
  { name: 'Orange', value: '#e67e22', className: 'bg-[#e67e22]' },
  { name: 'Red', value: '#e74c3c', className: 'bg-[#e74c3c]' },
  { name: 'Teal', value: '#1abc9c', className: 'bg-[#1abc9c]' },
];


export default function ProjectCard({ project }: ProjectCardProps) {
  const projectColorStyle = projectColors.find(pc => pc.value === project.color)?.className || 'bg-primary';

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold text-foreground">{project.name}</CardTitle>
          <div className={`w-5 h-5 rounded-full ${projectColorStyle} ring-2 ring-offset-2 ring-background`} title={`Color: ${project.color}`}>
             <span className="sr-only">Project color indicator</span>
          </div>
        </div>
        {project.description && (
          <CardDescription className="text-muted-foreground pt-1 line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="text-sm text-muted-foreground flex items-center">
          <Users className="w-4 h-4 mr-2 text-primary" />
          <span>{project.memberIds.length} member{project.memberIds.length === 1 ? '' : 's'}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/project/${project.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Open Project
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
