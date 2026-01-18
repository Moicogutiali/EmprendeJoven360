import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="uppercase text-xs font-medium">{i18n.language.split('-')[0]}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuItem onClick={() => changeLanguage("es")} className="cursor-pointer">
                    <span className="mr-2">🇪🇸</span> Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("en")} className="cursor-pointer">
                    <span className="mr-2">🇺🇸</span> English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
