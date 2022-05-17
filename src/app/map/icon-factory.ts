import * as L from "leaflet";

export class IconFactory{

    static createDivIcon(classNames: string[]): L.DivIcon {
        const classes = classNames.join(" ");
        return  L.divIcon({ className: classes });
    }
}