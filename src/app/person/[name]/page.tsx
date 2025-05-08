import { initializeDatabase } from "@/lib/db";
import { getRelationshipsForPerson, type Relationship } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { Metadata } from 'next';

type Props = {
  params: { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const personName = decodeURIComponent(params.name);
  
  return {
    title: `${personName} | Social Graph`,
    description: `View relationships for ${personName}`
  };
}

export default async function PersonPage({ params }: Props) {
  const personName = decodeURIComponent(params.name);
  let relationships: Relationship[] = [];

  try {
    // Initialize database connection
    initializeDatabase();

    // Get relationships for this person
    relationships = await getRelationshipsForPerson(personName);
  } catch (error) {
    console.error('Error fetching relationships:', error);
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" passHref>
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to People
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Relationships for {personName}</h1>
          <p className="text-gray-500 mt-2">
            Showing closeness scores with other people
          </p>
        </div>

        {relationships.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6 text-gray-500">
                No relationships found for {personName}. Try making some comparisons first.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {relationships.map((rel, index) => {
              // Determine the other person in the relationship
              const otherPerson = rel.person1 === personName ? rel.person2 : rel.person1;

              return (
                <Link href={`/person/${encodeURIComponent(otherPerson)}`} key={index} className="block">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-500 mr-4">
                            {otherPerson.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <h3 className="font-medium text-lg">{otherPerson}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge className="mb-1 text-lg py-1 px-3">
                            Score: {rel.closeness_score}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Compared {rel.comparison_count} times
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
