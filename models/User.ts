class User {

    uid: string | null;
    email: string | null;
    displayName: string | null;    
    profImageUrl: string | null;
    createdAt: string | null;

    constructor(uid: string | null, email: string | null, displayName: string | null,
        profImageUrl: string | null, createdAt: string | null) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.profImageUrl = profImageUrl;
        this.createdAt = createdAt;
    }

    get guid(){
        return this.uid;
    }
}

export default User;


