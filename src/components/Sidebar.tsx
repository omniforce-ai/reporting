import React, { useState } from 'react';
import type { NavItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { AnalyticsIcon, ChevronDownIcon, InboxIcon, IntegrationsIcon, OmniforceLogoWhite, SupportIcon, TasksIcon } from '@/components/icons';

const navigation: NavItemType[] = [
  { name: 'Inbox', icon: InboxIcon, href: '#', current: false },
  { name: 'Tasks', icon: TasksIcon, href: '#', current: false },
  { name: 'Agent templates', icon: AnalyticsIcon, href: '#', current: true },
  { name: 'Integrations', icon: IntegrationsIcon, href: '#', current: false },
];

const agents: NavItemType[] = [
    { name: 'Sales Operations Agent', icon: ChevronDownIcon, href: '#', current: false, children: [] },
    { name: 'Document Management Agent', icon: ChevronDownIcon, href: '#', current: false, children: [] },
    { name: 'FNOL Claim Agent', icon: ChevronDownIcon, href: '#', current: false, children: [] },
    { name: 'Email Triage Agent', icon: ChevronDownIcon, href: '#', current: false, children: [] },
];

const NavItem: React.FC<{ item: NavItemType }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);

    const hasChildren = item.children && item.children.length > 0;
    
    const Icon = item.icon;

    return (
        <div>
            <Button
                variant={item.current ? "secondary" : "ghost"}
                className="w-full justify-between"
                onClick={(e) => {
                    if(item.name.includes("Agent")) {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                asChild
            >
                <a href={item.href}>
                    <span className="flex-1">{item.name}</span>
                    {item.name.includes("Agent") && (
                        <Icon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </a>
            </Button>
            {hasChildren && isOpen && item.children && (
                <div className="pl-6 mt-1 space-y-1">
                    {item.children.map(child => <NavItem key={child.name} item={child} />)}
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC = () => {
    return (
        <div className="flex flex-col w-64 h-full bg-card border-r border-border">
            <div className="flex flex-col flex-1 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <OmniforceLogoWhite className="w-8 h-8 flex-shrink-0" aria-label="Omniforce Logo" />
                        <span className="text-lg font-semibold">Omniforce</span>
                    </div>
                </div>
                {/* Workspace Switcher */}
                <div className="mb-6">
                    <Button variant="secondary" className="w-full justify-between">
                        <span>My Workspace</span>
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => (
                        <Button
                            key={item.name}
                            variant={item.current ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            asChild
                        >
                            <a href={item.href}>
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </a>
                        </Button>
                    ))}
                </nav>

                {/* Agents Section */}
                 <div className="mt-6">
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Agents</h3>
                    <div className="space-y-1">
                        {agents.map(agent => <NavItem key={agent.name} item={agent} />)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#">
                        <SupportIcon className="w-5 h-5 mr-3" />
                        Chat & support
                    </a>
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
