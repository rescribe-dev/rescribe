/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Go;
import processing.core.*;
/**
 *
 * @author mycicle
 */
public class Go extends PApplet {
    boolean color = true;
    Piece[] pieces;
    int pieceCounter;
    public void settings(){
        size(690, 690);
        pieces = new Piece[21*21];
        pieceCounter = 0;
    }
    public void draw(){
        background(233, 139, 57);
        drawGoBoard(this.width, this.height); 
        drawPieces(pieces);
    }
    public static void main(String[] args){
        PApplet.main("Go.Go");
    }
    
    private void drawGoBoard(int w, int h){
        
        for(int i = (w/23); i <= (22*w/23); i += (w/23)){
            line(i, (h/23), i, (22*h/23));
        }
        for(int j = (h/23); j <= (22*h/23); j += (h/23)){
            line((w/23), j, (22*w/23), j);
        }
    }
    private void setPiece(int x, int y, boolean c, int w, int h){
        int ww = w/23;
        int hh = h/23;
        int act_x = 0;
        int act_y = 0;
        if(x%ww == 0){
            act_x = x;
        }
        else if(x%ww < (ww/2)){
            act_x = x - x%ww;
        }
        else{
            act_x = x + (ww - (x%ww));
        }
            
        if(y%hh == 0){
            act_y = y;
        }
        else if(y%hh < (hh/2)){
            act_y = y - y%hh;
        }
        else{
            act_y = y + (hh - (y%hh));
        }
        if((x > ww) && (x < (w-ww)) && (y > hh) && (y < (h-hh))){
            this.pieces[pieceCounter] = new Piece(act_x, act_y, c, (ww-2));
            ++pieceCounter;
        }
        else{
            System.out.println("Piece out of bounds");
        }
    }
    public void drawPieces(Piece[] p){
        for(Piece i : p){
            if(i == null){
                break;
            }
            else if(i.c)
              fill(255);
            else
              fill(0);
             circle(i.x, i.y, i.r);
        }
    }
    @Override
    public void mouseClicked(){
        setPiece(mouseX, mouseY, color, this.width, this.height);
        color = !color;
    }
    
    class Piece{
        private int x, y, r;
        private boolean c;
        Piece(int xx, int yy, boolean cc, int rad){
            x = xx;
            y = yy;
            c = cc;
            r = rad;
        }
        
    }
}
