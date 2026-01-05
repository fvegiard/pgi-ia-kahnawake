"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Mail, Building2 } from "lucide-react";

const teams = [
  {
    id: "1",
    name: "Architecture",
    role: "Design & Planning",
    color: "#3B82F6",
    members: [
      { name: "Jean-Pierre Tremblay", role: "Lead Architect", email: "jp@example.com" },
      { name: "Marie Dubois", role: "Senior Architect", email: "marie@example.com" },
      { name: "Pierre Gagnon", role: "Architect", email: "pierre@example.com" },
    ],
  },
  {
    id: "2",
    name: "Engineering",
    role: "Structural & MEP",
    color: "#10B981",
    members: [
      { name: "Claude Martin", role: "Structural Engineer", email: "claude@example.com" },
      { name: "Sophie Lefebvre", role: "Mechanical Engineer", email: "sophie@example.com" },
      { name: "Marc Bouchard", role: "Electrical Engineer", email: "marc@example.com" },
    ],
  },
  {
    id: "3",
    name: "Project Management",
    role: "Coordination",
    color: "#8B5CF6",
    members: [
      { name: "Louise Roy", role: "Project Manager", email: "louise@example.com" },
      { name: "Robert Cote", role: "Assistant PM", email: "robert@example.com" },
    ],
  },
  {
    id: "4",
    name: "Scenography",
    role: "Theatre & AV",
    color: "#06B6D4",
    members: [
      { name: "Isabelle Morin", role: "Scenographer", email: "isabelle@example.com" },
      { name: "Michel Lavoie", role: "AV Specialist", email: "michel@example.com" },
    ],
  },
];

export default function TeamsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Teams
          </h1>
          <p className="text-gray-500">Project team members and contacts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teams.length}</p>
              <p className="text-sm text-gray-500">Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {teams.reduce((acc, t) => acc + t.members.length, 0)}
              </p>
              <p className="text-sm text-gray-500">Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription>{team.role}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{team.members.length} members</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Project Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Project Name</p>
              <p className="font-medium">Centre Culturel et Artistique Kahnawake</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">Kahnawake, Quebec</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Project Type</p>
              <p className="font-medium">Cultural Center & Theatre</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
