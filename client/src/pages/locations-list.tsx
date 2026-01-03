import { useLocations } from "@/hooks/use-locations";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function LocationsListPage() {
  const { data: locations, isLoading } = useLocations();

  return (
    <LayoutShell>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Locations</h1>
            <p className="text-slate-500">Manage all your connected business profiles</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
            Add Location
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="shadow-sm border-slate-200">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            locations?.map((location) => (
              <Card key={location.id} className="group hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                      {location.name}
                    </CardTitle>
                    <div className="flex items-center text-xs text-slate-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{location.address || "No address provided"}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View on Google</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Disconnect</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Rating</span>
                      <div className="flex items-center font-bold text-slate-900">
                        4.8 <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-1">Status</span>
                      <div className="flex items-center font-bold text-emerald-600 text-sm">
                        Verified
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <Link href={`/dashboard?location=${location.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                      View Dashboard <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
