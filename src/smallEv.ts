export class SmallEv {
    private listener = new Set<() => void>();
    public on(cb: () => void) {
        this.listener.add(cb);
    }
    public emit() {
        this.listener.forEach(_ => _());
    }
}
