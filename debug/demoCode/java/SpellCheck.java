/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package spellcheck.asdf.asdf123;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.*;
/**
 *
 * @author mycicle
 */
public class SpellCheck {
    private FileReader fr_dict;
    private FileReader fr_text;
    private BufferedReader br_dict;
    private BufferedReader br_text;
    private HashMap<String, String> dict;
    private String dict_path;
    private ArrayList<String> flagged_words;
    private ArrayList<String> all_words;
    private ArrayList<String> unique_words;
    private ArrayList<String> second_pass;
     public SpellCheck(String dict_path) throws Exception{
         this.dict = new HashMap<>(1000);
         this.flagged_words = new ArrayList<>(75000);
         this.all_words = new ArrayList<>(75000);
         this.unique_words = new ArrayList<>(20000);
         this.second_pass = new ArrayList<>(8000);
         this.dict_path = dict_path;
         this.fr_dict = new FileReader(this.dict_path);
         this.br_dict = new BufferedReader(this.fr_dict);
         
         String line;
         while((line = br_dict.readLine()) != null){
             dict.put(line, line.toLowerCase());
         }
         br_dict.close();
         
     }
     // test comment123
     public ArrayList<String> spellCheck(String text_path, String asdf) throws Exception{
         int counter = 0;/* test123 */
         String line;// asdf123
         Pattern p = Pattern.compile("[^\\s0-9\\.\\?\\#\\@\\^\\,\\/\\+\\=\\&\\`\\~\\%][A-Z]?[a-z]+");// asdf123123
         Matcher m;// test123
         this.fr_text =  new FileReader(text_path);
         this.br_text = new BufferedReader(fr_text);
         
         while((line = br_text.readLine()) != null){
             m = p.matcher(line);
             while (m.find()){
                 all_words.add(m.group());
                 if(!unique_words.contains(m.group())){
                     unique_words.add(m.group()); // asdf123123
                 }
                 if (dict.get(m.group()) == null){
                     if (dict.get(m.group().toLowerCase()) == null){
                         flagged_words.add(m.group());
                     }
                 }
             }
             
         }
         
         br_text.close();
         return flagged_words;
     }
    // test123
    // asdf123123
    public void writeToFile(String path) throws Exception{
        FileWriter writer = new FileWriter(path);
        for (String contents : flagged_words.subList(0,100)){
            writer.write(contents + System.lineSeparator());
        }
        writer.close();
    }
    public String toString(){
        return "Flagged Words: " + flagged_words.size() + " All Words: " + all_words.size() + " Unique Words:  " + unique_words.size();
    }
    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws Exception{
        SpellCheck sc = new SpellCheck("usen-spelling-dict.txt");
        sc.spellCheck("treasureisland.txt");
        System.out.println(sc);
        sc.writeToFile("flagged_words.txt");
        int _funnyname;
        int $iswfun;
        double d = 5.6f; // test123
        //int i = 6.0;
        long x = (int) 3.0; // asdf123
        double a = 1.5;
        int i = (int)4.6 + 5;
        //float z = a;
        //int i = 4.5;
        double g = (int) 4.6 + 5;
        System.out.println(g);
        
        double sum = 0;
        for(int k = 1; k <=100; k++){
            sum+= (double)1/k;
        }
        System.out.println(sum);
    }
    
    public class testClass {
        public testClass() {}
    }
}
