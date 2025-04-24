import React from 'react';
import {
  NotificationsOutlined,
  ChatBubbleOutlineOutlined,
  PeopleAltOutlined,
  CalendarTodayOutlined,
  CallOutlined,
  FolderOutlined,
  MoreHorizOutlined,
  AddOutlined,
  HelpOutlineOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

interface NavItem {
  icon: React.ComponentType<SvgIconProps>;
  label: string;
  active?: boolean;
  badge?: number;
}

const LeftSidebar = () => {
  const navItems: NavItem[] = [
    { icon: NotificationsOutlined, label: 'Activity', badge: 2 },
    { icon: ChatBubbleOutlineOutlined, label: 'Chat' },
    { icon: PeopleAltOutlined, label: 'Teams' },
    { icon: CalendarTodayOutlined, label: 'Calendar', active: true },
    { icon: CallOutlined, label: 'Calls' },
    { icon: FolderOutlined, label: 'Files' },
    { icon: MoreHorizOutlined, label: 'More apps' },
  ];

  const bottomItems: NavItem[] = [
    { icon: AddOutlined, label: 'Apps' },
    { icon: HelpOutlineOutlined, label: 'Help' },
    { icon: SettingsOutlined, label: 'Settings' }
  ];

  return (
    <div className="w-[68px] bg-[#292929] flex flex-col items-center py-2 justify-between">
      {/* Top Icons */}
      <div className="flex flex-col items-center space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={`relative w-12 h-12 flex items-center justify-center rounded-md 
                ${item.active 
                  ? 'bg-[#444791] text-white' 
                  : 'text-[#A8A8A8] hover:bg-[#3D3D3D] hover:text-white'
                }
                transition-colors duration-150 ease-in-out`}
              aria-label={item.label}
            >
              <Icon sx={{ fontSize: 22 }} />
              {item.badge && (
                <span className="absolute top-1 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center 
                  bg-[#C4314B] text-white text-xs rounded-full px-1">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center space-y-1 mb-2">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="w-12 h-12 flex items-center justify-center text-[#A8A8A8] 
                hover:bg-[#3D3D3D] hover:text-white rounded-md
                transition-colors duration-150 ease-in-out"
              aria-label={item.label}
            >
              <Icon sx={{ fontSize: 22 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeftSidebar; 