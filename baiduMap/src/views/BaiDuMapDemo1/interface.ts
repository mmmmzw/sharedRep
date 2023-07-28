export enum Scene {
    All = 0,
    场景1 = 1,
    场景2 = 2,
    场景3 = 3
}
export interface Info {
    urgency: number,
    scene: number,
    color?: string,
    urgencyLabel?: string
}
export interface MyPoints {
    lat: number,
    lng: number,
    info: Info,
    markers?: any
}
