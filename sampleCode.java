/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package calculator;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.*;
/**
 *
 * @author mycicle
 */

//..forloop[1:10:1]
public class Calculator extends JFrame{
    private JButton[] jba = new JButton[16];
    private String[] jbaChar = {"7", "8", "9", "*", "4", "5", "6","-", "1", "2", "3", "+", "0", ".", "=", "C"};
    private JTextArea text = new JTextArea();
    private Stack<String> stack = new Stack<>();
    private String n1 = new String();
    private String n2 = new String();
    private boolean second = false;
    public Calculator(){
        super(); //calls the parent's constructor
        setSize(500, 500);
        Font displayFont = new Font("Arial", Font.PLAIN, 100);
        text.setFont(displayFont);
        Container c = getContentPane();  //sets up a container webdev style
        JPanel p = new JPanel(); //set up a panel in the frame
        p.setLayout(new GridLayout(4, 4));
        for(int i = 0; i < 16; i++){
            jba[i] = new JButton((""+jbaChar[i]));
            p.add(jba[i]);
            jba[i].addActionListener(new MouseEvent());
            
        }
        //JButton b = new JButton("Displayed string");
        //p.add(b);
        c.add(BorderLayout.CENTER, p);
        c.add(BorderLayout.NORTH, text);
        
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setVisible(true);
    }
    /**
     * @param args the command line arguments
     */
   
    class MouseEvent implements ActionListener{

    @Override  //override javas version of this function 
    public void actionPerformed(ActionEvent e) {
        //this is where my actions will go
        for(int i = 0; i< 16; i++){
            if (e.getSource() == jba[i]){
                text.append(jbaChar[i] + "");
                if(i == 15){
                    text.setText(" ");
                }
                return;
            }
            
        }
    }
    //action listener is an interface whichwe implement not extend
    
}
    public static void main(String[] args) {
        // TODO code application logic here
        Calculator c = new Calculator();
    }
    
}



