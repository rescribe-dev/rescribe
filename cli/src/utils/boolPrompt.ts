import prompts from 'prompts';

export interface YesNoChoices {
  title: string;
  value: boolean;
};

const yesNoPrompt = async (question: string): Promise<boolean> => {
  const choices: Array<YesNoChoices> = [
    {
      title: 'No',
      value: false
    },
    {
      title: 'Yes',
      value: true
    },
  ];
  const response = await prompts([
    {
      type: 'select',
      name: 'yesNo',
      choices: choices,
      message: question
    }
  ]);
  return response.yesNo;
};

export default yesNoPrompt;
