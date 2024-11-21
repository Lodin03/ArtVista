export interface Artwork {
    id: string,
    title: string;
    abstract: string;
    yearCreated: number;
    imageURL: string;
    hashtags: string[];
    category: string;
    artist: Artist;
    comments: Array<{
        commentId: number;
        username: string;
        email: string;
        text: string;
    }>;
    usersWhoLiked: string[];
}

export interface Artist {
    name: string;
    country: string;
    yearBorn: number;
    yearDead: number;
    about: string;
}