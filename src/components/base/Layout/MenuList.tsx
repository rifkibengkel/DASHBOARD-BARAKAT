import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Popover from '@mui/material/Popover';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Menu } from '@/types';
import MenuSelector from './MenuSelector';

interface MenuListProps {
    menu: Menu[];
    currentPath: string;
    menuCollapsed: boolean;
}

const MenuListComponent: React.FC<MenuListProps> = ({ menu, currentPath, menuCollapsed }) => {
    const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
    const [popoverAnchor, setPopoverAnchor] = useState<null | HTMLElement>(null);
    const [popoverMenu, setPopoverMenu] = useState<Menu | null>(null);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
                hoverTimeout.current = null;
            }
            setPopoverAnchor(null);
            setPopoverMenu(null);
        };
    }, []);

    const toggleSubmenu = useCallback((id: number) => {
        setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handlePopoverOpen = useCallback(
        (id: number, event: React.MouseEvent<HTMLElement>) => {
            if (menuCollapsed) {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                setPopoverAnchor(event.currentTarget);
                const menuItem = menu.find((item) => item.id === id);
                setPopoverMenu(menuItem || null);
            }
        },
        [menuCollapsed, menu]
    );

    const handlePopoverLeave = useCallback(() => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => {
            setPopoverAnchor(null);
            setPopoverMenu(null);
        }, 250);
    }, []);

    const handlePopoverEnter = useCallback(() => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    }, []);

    const renderSubMenuItems = useCallback(
        (children: Menu[], isInPopover = false) =>
            children.map((sub) => (
                <ListItemButton
                    key={sub.path}
                    component={Link}
                    href={sub.path}
                    selected={currentPath === sub.path}
                    sx={!isInPopover ? { pl: 4 } : {}}
                    aria-label={`Go to ${sub.menu}`}
                >
                    <ListItemIcon sx={{ width: '24px', minWidth: '0px', mr: 2 }}>
                        <MenuSelector type={sub.icon as string} />
                    </ListItemIcon>
                    <ListItemText primary={sub.menu} />
                </ListItemButton>
            )),
        [currentPath]
    );

    const renderMenuItem = useCallback(
        (item: Menu) => {
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
                const isExpanded = expandedMenus.has(item.id);

                return (
                    <React.Fragment key={item.id}>
                        <ListItemButton
                            onClick={() => !menuCollapsed && toggleSubmenu(item.id)}
                            onMouseEnter={(e) => handlePopoverOpen(item.id, e)}
                            onMouseLeave={handlePopoverLeave}
                            aria-expanded={isExpanded}
                            aria-controls={`submenu-${item.id}`}
                            aria-label={`Toggle submenu for ${item.menu}`}
                        >
                            <ListItemIcon sx={{ width: '24px', minWidth: '0px', mr: 2 }}>
                                <MenuSelector type={item.icon as string} />
                            </ListItemIcon>
                            {!menuCollapsed && <ListItemText primary={item.menu} />}
                            {!menuCollapsed && (isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                        </ListItemButton>

                        {!menuCollapsed && (
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit id={`submenu-${item.id}`}>
                                <List component="div" disablePadding>
                                    {renderSubMenuItems(item.children!)}
                                </List>
                            </Collapse>
                        )}

                        <Popover
                            open={Boolean(popoverAnchor && popoverMenu?.id === item.id)}
                            anchorEl={popoverAnchor}
                            onClose={handlePopoverLeave}
                            anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'center', horizontal: 'left' }}
                            slotProps={{ paper: { sx: { minWidth: 180, p: 1 } } }}
                            disableRestoreFocus
                            onMouseEnter={handlePopoverEnter}
                            onMouseLeave={handlePopoverLeave}
                        >
                            <List component="div" disablePadding>
                                {popoverMenu?.id === item.id &&
                                    item.children &&
                                    renderSubMenuItems(item.children, true)}
                            </List>
                        </Popover>
                    </React.Fragment>
                );
            }

            return (
                <ListItemButton
                    key={item.id}
                    component={Link}
                    href={item.path}
                    selected={currentPath === item.path}
                    aria-label={`Go to ${item.menu}`}
                >
                    <ListItemIcon sx={{ width: '24px', minWidth: '0px', mr: 2 }}>
                        <MenuSelector type={item.icon as string} />
                    </ListItemIcon>
                    {!menuCollapsed && <ListItemText primary={item.menu} />}
                </ListItemButton>
            );
        },
        [
            expandedMenus,
            menuCollapsed,
            toggleSubmenu,
            handlePopoverOpen,
            handlePopoverLeave,
            popoverAnchor,
            popoverMenu,
            handlePopoverEnter,
            currentPath,
            renderSubMenuItems,
        ]
    );

    return <List>{menu.length > 0 ? menu.map(renderMenuItem) : null}</List>;
};

export default React.memo(MenuListComponent);
