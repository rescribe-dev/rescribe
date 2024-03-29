import { PreviewFieldsFragment } from 'lib/generated/datamodel';

export const defaultPreview = `package test;
public class Test {
  public static void main(String[] args) {
    System.out.println("Hello World!");
  }
}`;

export const defaultEndPreview = `public class Later {
  public static string hello() {
    System.out.println("Hello World");
  }
}`;

export const getPreviewData = (previewText: string): PreviewFieldsFragment => {
  const splitText = previewText.split('\n');
  const endSplit = defaultEndPreview.split('\n');
  return {
    startPreviewLineNumber: 0,
    endPreviewLineNumber: splitText.length,
    startPreviewContent: splitText,
    endPreviewContent: endSplit,
  };
};
