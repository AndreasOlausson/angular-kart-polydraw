import * as L from "leaflet";

export class IconFactory{

    static createDivIcon(classNames: string[], specialClass: string): L.DivIcon {
        
        let classes = classNames.join(" ");
        if(specialClass.length > 0) {
            classes += " " + specialClass;
        }
        return  L.divIcon({ className: classes });
    }
}