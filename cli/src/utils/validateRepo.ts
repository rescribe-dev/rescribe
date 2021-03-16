import { cacheData } from './config';
import Git, { Remote } from 'nodegit';
import { setRepoUtil } from '../actions/setRepository';
import yesNoPrompt from './boolPrompt';
import sleep from './sleep';

export default async (repo: Git.Repository): Promise<void> => {
    const remotes = await Remote.list(repo);
    const remote = await Remote.lookup(repo, remotes[0]);
    console.log(remote.url());
    const remoteUrl = remote.url() as string;
    console.log(remoteUrl);
    const splitUrl  = remoteUrl.split('/');
    const repoName = splitUrl[splitUrl.length-1].split('.git')[0];
    
    
    if (cacheData.repository === repoName) {
        return;
    }
    
    let confirmedSelect = false;
    console.log(`reScribe is using repository <${cacheData.repository}> but you are currently in repository <${repoName}>\n`);
    confirmedSelect = !(await yesNoPrompt('Would you like to change this?'));
    if (confirmedSelect) {
      return;
    } else {
        const setRepoData = await setRepoUtil({});
        if (!setRepoData) {
            return;
        }
        // NOTE - this sleep is here because of race conditions in elastic
        // where you save the repo, and then immediately query it.
        await sleep(2000);
    }
};