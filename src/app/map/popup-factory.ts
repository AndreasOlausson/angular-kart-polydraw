// import { ILatLng } from "./polygon-helpers";

// export class PopupFactory {

//     private generateMenuMarkerPopup(latLngs: ILatLng[]):any {

//         const self = this;

//         const outerWrapper: HTMLDivElement = document.createElement("div");
//         outerWrapper.classList.add("alter-marker-outer-wrapper");

//         const wrapper: HTMLDivElement = document.createElement("div");
//         wrapper.classList.add("alter-marker-wrapper");

//         const invertedCorner: HTMLElement = document.createElement("i");
//         invertedCorner.classList.add("inverted-corner");

//         const markerContent: HTMLDivElement = document.createElement("div");
//         markerContent.classList.add("content");

//         const markerContentWrapper: HTMLDivElement = document.createElement("div");
//         markerContentWrapper.classList.add("marker-menu-content");

//         const simplify: HTMLDivElement = document.createElement("div");
//         simplify.classList.add("marker-menu-button", "simplify")
//         simplify.title="Simplify";

//         const separator: HTMLDivElement = document.createElement("div");
//         separator.classList.add("separator");
//         const bbox: HTMLDivElement = document.createElement("div");
//         bbox.classList.add("marker-menu-button", "bbox");
//         bbox.title = "Bounding box";


//         outerWrapper.appendChild(wrapper);
//         wrapper.appendChild(invertedCorner);
//         wrapper.appendChild(markerContent);
//         markerContent.appendChild(markerContentWrapper);
//         markerContentWrapper.appendChild(simplify);
//         markerContentWrapper.appendChild(separator);
//         markerContentWrapper.appendChild(bbox);

//         simplify.onclick = function () {
//             self.convertToSimplifiedPolygon(latLngs);
//             // do whatever else you want to do - open accordion etc
//         };
//         bbox.onclick = function () {
//             self.convertToBoundsPolygon(latLngs);
//             // do whatever else you want to do - open accordion etc
//         };



//         return outerWrapper;
        

//     }
//     private generateInfoMarkerPopup(area: number, perimeter: number):any {

//         const self = this;

//         const outerWrapper: HTMLDivElement = document.createElement("div");
//         outerWrapper.classList.add("info-marker-outer-wrapper");

//         const wrapper: HTMLDivElement = document.createElement("div");
//         wrapper.classList.add("info-marker-wrapper");

//         const invertedCorner: HTMLElement = document.createElement("i");
//         invertedCorner.classList.add("inverted-corner");

//         const markerContent: HTMLDivElement = document.createElement("div");
//         markerContent.classList.add("content");

//         const rowWithSeparator: HTMLDivElement = document.createElement("div");
//         rowWithSeparator.classList.add("row", "bottom-separator");

//         const perimeterHeader: HTMLDivElement = document.createElement("div");
//         perimeterHeader.classList.add("header")
//         perimeterHeader.innerText= self.config.markers.markerInfoIcon.perimeterLabel;

//         const emptyDiv: HTMLDivElement = document.createElement("div");

//         const perimeterArea: HTMLSpanElement = document.createElement("span");
//         perimeterArea.classList.add("area");
//         perimeterArea.innerText = perimeter.toString();
//         const perimeterUnit: HTMLSpanElement = document.createElement("span");
//         perimeterUnit.classList.add("unit");
//         perimeterUnit.innerText = " m";




//         const row: HTMLDivElement = document.createElement("div");
//         row.classList.add("row");

//         const areaHeader: HTMLDivElement = document.createElement("div");
//         areaHeader.classList.add("header")
//         areaHeader.innerText= self.config.markers.markerInfoIcon.areaLabel;

//         const rightRow: HTMLDivElement = document.createElement("div");
//         row.classList.add("right-margin");

//         const areaArea: HTMLSpanElement = document.createElement("span");
//         areaArea.classList.add("area");
//         areaArea.innerText = area.toString();
//         const areaUnit: HTMLSpanElement = document.createElement("span");
//         areaUnit.classList.add("unit");
//         areaUnit.innerText = " m";

//         const sup: HTMLElement = document.createElement("i");
//         sup.classList.add("sup");
//         sup.innerText = "2";




//         outerWrapper.appendChild(wrapper);
//         wrapper.appendChild(invertedCorner);
//         wrapper.appendChild(markerContent);
//         markerContent.appendChild(rowWithSeparator);
//         rowWithSeparator.appendChild(perimeterHeader);
//         rowWithSeparator.appendChild(emptyDiv);
//         emptyDiv.appendChild(perimeterArea);
//         emptyDiv.appendChild(perimeterUnit);
//         markerContent.appendChild(row);
//         row.appendChild(areaHeader);
//         row.appendChild(rightRow);
//         rightRow.appendChild(areaArea);
//         rightRow.appendChild(areaUnit);
//         areaUnit.appendChild(sup);


//         return outerWrapper;
        

//     }

// }