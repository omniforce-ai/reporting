import { getAllTenantsFromSupabase } from '@/lib/utils/tenant';
import Link from 'next/link';
import { UserCircleIcon, ArrowRightIcon } from '@/components/icons';
import { MoreVerticalIcon } from 'lucide-react';
import CreateClientForm from '@/components/admin/CreateClientForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default async function AdminClientsPage() {
  const tenants = await getAllTenantsFromSupabase();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-3xl font-semibold">All Clients</h1>
              <p className="text-sm text-muted-foreground">Manage and view all client accounts</p>
            </div>
            <CreateClientForm />
          </div>

          {/* Table */}
          <div className="px-4 lg:px-6">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Subdomain</TableHead>
                    <TableHead>APIs</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserCircleIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No clients yet</p>
                          <p className="text-xs text-muted-foreground">Clients will appear here once they're added to the system.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((client) => {
                      const apiKeys = (client.apiKeys as { smartlead?: string; lemlist?: string } | null) || {};
                      const hasSmartlead = !!apiKeys.smartlead;
                      const hasLemlist = !!apiKeys.lemlist;

                      return (
                        <TableRow key={client.id}>
                          <TableCell>
                            <Link
                              href={`/clients/${client.subdomain}/dashboard`}
                              className="flex items-center gap-3 hover:text-primary transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <UserCircleIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{client.name || client.subdomain}</div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{client.subdomain}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {hasSmartlead && (
                                <Badge variant="outline" className="text-xs">
                                  Smartlead
                                </Badge>
                              )}
                              {hasLemlist && (
                                <Badge variant="outline" className="text-xs">
                                  Lemlist
                                </Badge>
                              )}
                              {!hasSmartlead && !hasLemlist && (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(client.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                  size="icon"
                                >
                                  <MoreVerticalIcon className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem asChild>
                                  <Link href={`/clients/${client.subdomain}/dashboard`}>
                                    View Dashboard
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/clients/${client.subdomain}`}>
                                    Edit Client
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Delete Client
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

