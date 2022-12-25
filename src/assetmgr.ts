import { SmallEv } from "./smallEv";

export class Assetmgr {
    private db = new Map<string, Blob | null>();
    public setAsset(id: string, blob: Blob) {
        this.db.set(id, blob);
        this.onload.emit();
    }
    public async loadAsset(id: string, url: URL) {
        this.db.set(id, null);
        this.onload.emit();
        this.db.set(id, await (await fetch(url)).blob());
        this.onload.emit();
    }
    readonly onload = new SmallEv();
    public loadstate() {
        return [[...this.db].reduce((prev, [id, blob]) => blob !== null ? prev + 1 : prev, 0), this.db.size];
    }
    public getAsset(id: string) {
        return this.db.get(id);
    }
}

export class AssetHandle {
    readonly onUpdate = new SmallEv();
    private data_: string = "";
    public get data() {
        return this.data_;
    }
    public set data(data: string) {
        this.data_ = data;
        this.onUpdate.emit();
    }
}
