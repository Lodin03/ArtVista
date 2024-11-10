export interface Artwork {
    id: string,
    title: string;
    abstract: string;
    yearCreated: string;
    imageURL: string;
    artist: {
        country: string,
        name: string,
        yearBorn: number,
        yearDead: number 
    }
    hashtags: string[]
}