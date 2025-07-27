"use client"

import { type Icon } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavAdmin({
  items,
  title = "관리자 메뉴",
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    isActive?: boolean
  }[]
  title?: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-orange-600 font-semibold">{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                isActive={item.isActive}
                className="hover:bg-orange-50 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-800"
              >
                <Link to={item.url}>
                  {item.icon && <item.icon className="text-orange-600" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}