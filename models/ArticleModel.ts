import { TagModel } from './TagModel';

export interface ArticleModel {
    
    id: string | null;
    title: string | null;
    content: string | null;
    orgUrl: string | null;
    favCount: string | null;
    author: string | null;
    premiumFlag: string | null;
    tags: TagModel[] | null;

}



