export interface Artwork {
    id: string,
    title: string;
    abstract: string;
    yearCreated: string;
    imageURL: string;
    hashtags: string[];
    artist: {
        country: string,
        name: string,
        yearBorn: number,
        yearDead: number,
        about: string
    }
}