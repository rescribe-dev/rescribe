#include"Chunk.cpp"
#include<iostream>
#include"Stack.cpp"
using namespace std;


//Linked lists are like a shopping list of items that you can take from and add to wherever
//WIWO wherever in whenever out
class LinkedList {
public:
  int length;
  Chunk* head;

  LinkedList(){
    length = 0;
    head = NULL;
  }
  //need a function to add things to the structure (3 cases)
  //need a function to remove things from the structure (3 cases)
  //need a function to display the structure
  //----------------------------------------------------------------------------------------------------
  void insertAtPos(int pos, int x) {
    //Check to see if they ask for a position that can be done
    if (pos>0 && pos <= (length + 1)){
      if (pos == 1){                                                                         //if they ask for the first position
	Chunk* temp = new Chunk; temp -> value = x;                                          //create a new Chunk; set its value
	temp -> next = head;                                                                 //grab on to the address of the old first chunk
	head = temp;                                                                         //have head recognize the new chunk as the first item on the list
      }
      else if(pos == length + 1){                                                            //if they ask for a new chunk to be added to the end
	Chunk* temp = head;                                                                  // have temp start at the beginning
       	while(temp -> next != NULL)                                                          // go down the list until you reach the last chunk
	temp = temp -> next; 
	temp -> next = new Chunk; temp -> next -> value = x;                                 //make a new chunk at the end; set its value

      }
      else{
	Chunk* temp = new Chunk; temp -> value = x;                                          //make a new chunk, set its value
	Chunk* helper = head;                                                                //start helper at the top
	for (int i = 1; i < pos-1; i++)                                                      //move helper down the list until you hit the position before the intended insertion position
	  helper = helper -> next;
	temp -> next = helper -> next;                                                       //have the new chunk grab the chain at its intended position
	helper -> next = temp;                                                               //have the chunk before the intended position ggrab the new chunk and weave it into the list
      }
      length++;                                                                              //increment length so you keep track of the number of items in the list              
    }
    //if they ask for a position that can't be done
    else
      cout<<"That position is invalid, the length of the linked list is: "<<length<<endl;
  }
  //-----------------------------------------------------------------------------------------------------
  void removeFromPos(int pos){
    //if they ask for a position that exists
    if (pos>0 && pos <= length && head != NULL){
      if (pos == 1) {                                   //if you need to delete the first item on the list
	Chunk* temp; temp = head;                       //make a pointer, start it at the top and grab the value of the first chunk
	head = head -> next;                            //have head recognize the second chunk as the new top chunk
	delete temp;                                    //delete the old top chunk. This here linked list aint big enough for the two of 'em
      }
      else if(pos == length && length != 1){            //if you need to delete the last chunk and you have more than one chunk in the list
	Chunk* temp; temp = head;                       //start temp at the first chunk
	Chunk* helper;                                  //give temp a helper just in case
	while (temp -> next -> next != NULL)            
	  temp = temp -> next;                          //increment temp until it points to the second to last chunk in the list
	helper = temp -> next;                          //have helper point at the last chunk in the list
	temp -> next = NULL;                            //ground the second to last chunk in the list
        delete helper;                                  //delete the last chunk in the list
      }
      else{                                             //if they ask to delete something in the middle
	Chunk* lead; lead = head;    
	Chunk* follow; follow = head;                   //make two pointers   start them at the top
	for (int i = 1; i < pos; i ++) {                //move the pointers so that lead stops at the position you want to delete 
	  follow = lead; lead = lead -> next;           //and follow stops at the one before that
       }
	follow -> next = lead -> next;                   //connect the chunk follow is pointing to to the one after the deleted position
	delete lead;                                     //delete the position you wanted to
      }
    }
    //if they ask to remove a position that does not exist
    else{
      cout<<"that position is invalid, or the list is empty. The length of the linked list is: "<<length<<endl; length++;    //increment length otherwise you end up reducing it next for nothing
    }
    length --;                                                                                                               //decrement length so you can keep track of the number of items on the list
  }
  //--------------------------------------------------------------------------------------------------------
  void deleteEveryOtherNode(){
    for(int i = 1; i <= (length);i++){
      removeFromPos(i);
    }
  }
  //--------------------------------------------------------------------------------------------------------
  void reverseOrder(){
    Stack stack;
    //if the list is empty
    if(head == NULL){
      cout<<"list is empty"<<endl;
      return;
    }
    else{
      Chunk* temp;
      temp = head;
      int i = 0;
      while(temp != NULL){
	stack.push(temp -> value);
	temp = temp -> next;
	i++;
      }
      temp = head;
      int k;
      for (int j = 0; j < i; j++){
        k = stack.pop();
	temp -> value = k;
	temp = temp -> next;
      }
    }

  }
  //--------------------------------------------------------------------------------------------------------
  void display(){
    Chunk* temp; temp = head;
    if (head == NULL)
      cout<<"nothing to display, list empty"<<endl;
    else{
      for (int i = 0; i<length; i++){
	cout<<"value "<<i+1<<" is: "<<temp -> value<<endl;temp = temp -> next;
    }
      cout<<"the length of the list is: "<<length<<endl;
  }
    
  } 
  //----------------------------------------------------------------------------------------------------------
  
};

