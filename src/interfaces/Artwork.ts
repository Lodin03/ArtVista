export interface Artwork {
    id: string,
    title: string;
    abstract: string;
    yearCreated: number;
    imageURL: string;
    hashtags: string[];
    category: string;
    artist: {
        country: string;
        name: string;
        yearBorn: number;
        yearDead: number;
        about: string;
    };
    comments: Array<{
        commentId: number;
        username: string;
        email: string;
        text: string;
    }>;
}