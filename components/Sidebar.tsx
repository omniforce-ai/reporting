
import React, { useState } from 'react';
import type { NavItemType } from '../types';
import { AnalyticsIcon, ChevronDownIcon, InboxIcon, IntegrationsIcon, SupportIcon, TasksIcon } from './icons';

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

    const linkClasses = `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
        item.current
        ? 'bg-slate-800 text-white'
        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
    }`;
    
    const Icon = item.icon;

    return (
        <div>
            <a href={item.href} className={linkClasses} onClick={(e) => {
                if(item.name.includes("Agent")) {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }
            }}>
                <span className="flex-1">{item.name}</span>
                {item.name.includes("Agent") && (
                     <Icon className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </a>
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
        <div className="flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800">
            <div className="flex flex-col flex-1 p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                           O
                        </div>
                        <span className="ml-3 text-lg font-semibold text-white">Omniforce</span>
                    </div>
                </div>
                {/* Workspace Switcher */}
                <div className="mb-6">
                    <button className="w-full flex items-center justify-between p-2 text-sm text-left bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-150">
                        <span>My Workspace</span>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-1">
                    {navigation.map((item) => (
                        <a key={item.name} href={item.href} className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                            item.current ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}>
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </a>
                    ))}
                </nav>

                {/* Agents Section */}
                 <div className="mt-6">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Agents</h3>
                    <div className="space-y-1">
                        {agents.map(agent => <NavItem key={agent.name} item={agent} />)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <a href="#" className="flex items-center text-sm text-slate-400 hover:text-white transition-colors duration-150">
                    <SupportIcon className="w-5 h-5 mr-3" />
                    Chat & support
                </a>
            </div>
        </div>
    );
};

export default Sidebar;
