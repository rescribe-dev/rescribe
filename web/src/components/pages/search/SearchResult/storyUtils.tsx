import { PreviewFieldsFragment } from 'lib/generated/datamodel';

export const defaultPreview = `package test;
public class Test {
  public static void main(String[] args) {
    Later.hello();
  }
}`;

export const defaultEndPreview = `public class Later {
  public static string hello() {
    System.out.println("Hello World");
  }
}`;

export const getPreviewData = (
  previewText: string,
  endviewText: string
): PreviewFieldsFragment => {
  const splitText = previewText.split('\n');
  const endSplit = endviewText.split('\n');
  return {
    startPreviewLineNumber: 0,
    endPreviewLineNumber: splitText.length + 10,
    startPreviewContent: splitText,
    endPreviewContent: endSplit,
  };
};
