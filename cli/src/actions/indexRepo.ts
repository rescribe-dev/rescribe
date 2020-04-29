// import Git, { TreeEntry } from 'nodegit';
// import { Arguments, Defined } from 'yargs';
/*
import { getRemoteBranches } from '../utils/git';
import indexBranch from './indexBranch';
import indexFiles from '../utils/indexFiles';
import { EventEmitter } from 'events';
import { start } from 'repl';


interface Args{
    path: string;
    branches?: string[];
}

export default async (args: Arguments<Args>): Promise<void> =>{
    if (! args.path){
        args.path = '.';
    }
    if (! args.branches){
        args.branches = await getRemoteBranches(args.path);
    }

    //get the current reository and then append all of the branches, commits, 
    //file trees, and walkers to lists
    const repo = await Git.Repository.open(args.path);
    let branches: string[] = [];
    let commits = [];
    let trees = [];
    let walkers: Array<NodeJS.EventEmitter & {start: () => void;}> = [];
    for (let i=0; i < args.branches.length; i++){
        branches.push((await repo.getBranch(args.branches[i])).name());
        commits.push(await repo.getBranchCommit(args.branches[i]));
        trees.push(await commits[i].getTree());
        walkers.push(trees[i].walk())
    } 

    return new Promise(async (resolve, reject) => {
        //callback will index the files given and either reject or index the files
        const callback = async (paths: string[], files: Buffer[], branchName: string): Promise<void> => {
            try {
                await indexFiles(paths, files, branchName);
            } catch (err){
                reject(err as Error);
            }
        }
        try {
            for (let i = 0; i < walkers.length; i++){
                const files: Buffer[] = [];
                const paths: string[] = [];
                let finished = false;

                walkers[i].on('entry', async (entry: TreeEntry) => {
                    const filePath = entry.path();
                    paths.push(filePath);
                    const file = await entry.getBlob();
                    if (file.isBinary()){
                        reject(new Error(`file ${filePath} is binary`));
                        return;
                    }
                    files.push(file.content());
                    if (finished && paths.length === files.length){
                        await callback(paths, files, branches[i]);
                    }
                });
                walkers[i].on('error', (err: Error) => {
                    throw err;
                });
                walkers[i].on('end', () => {
                    finished = true;
                });
                walkers[i].start();
            }
    } catch(err){
        reject(err as Error);
    }
    resolve();
    })
}
*/
