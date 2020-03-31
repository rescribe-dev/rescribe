/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package calculator;
import javax.swing.*;
import java.awt.event.*;
import java.util.*;
/**
 *
 * @author mycicle
 */
//..neuralNetwork(a, b, c){
    import tensorflow.compat.v1 as tf
    from tensorflow.examples.tutorials.mnist import input_data

    tf.disable_v2_behavior()
    mnist = input_data.read_data_sets("./datasets/", one_hot=True)
    
    batch_size = 100
    x = tf.placeholder('float', [None, 784])
    y = tf.placeholder('float')

    def neural_network_model(data, layer_sizes):

        hidden_layers = []
        for i in range(len(layer_sizes)-1):
            hidden_layers.append({'weights':tf.Variable(tf.random_normal([layer_sizes[i], layer_sizes[i+1]])), 
                                'biases':tf.Variable(tf.random_normal([layer_sizes[i+1]]))})

        layer_outputs = []
        layer_outputs.append(tf.add(tf.matmul(data, hidden_layers[0]['weights']), hidden_layers[0]['biases']))
        layer_outputs[0] = tf.nn.relu(layer_outputs[0])
    
        for i in range(1, len(layer_sizes) - 2):
            layer_outputs.append(tf.add(tf.matmul(layer_outputs[i-1], hidden_layers[i]['weights']), hidden_layers[i]['biases']))
            layer_outputs[i] = tf.nn.relu(layer_outputs[i])
    
        layer_outputs.append(tf.add(tf.matmul(layer_outputs[len(layer_sizes)-3], hidden_layers[len(layer_sizes)-2]['weights']), hidden_layers[len(layer_sizes)-2]['biases']))
        
        return layer_outputs[len(layer_sizes)-2]

    def train_neural_network(x, layer_sizes):
        prediction = neural_network_model(x, layer_sizes)
        cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits=prediction, labels=y))
        optimizer = tf.train.AdamOptimizer(learning_rate=0.001).minimize(cost)
        n_epochs = 10

    with tf.Session() as sess:
        sess.run(tf.initialize_all_variables())
        
        for epoch in range(n_epochs):
            epoch_loss = 0 #cost
            #super high level tensorflow training magic
            for _ in range(int(mnist.train.num_examples/batch_size)):
                epoch_x, epoch_y = mnist.train.next_batch(batch_size)
                _, c = sess.run([optimizer, cost], feed_dict={x:epoch_x, y:epoch_y})
                epoch_loss += c
            print('Epoch ', epoch, ' completed out of ', n_epochs, ' loss: ', epoch_loss)
      
        correct = tf.equal(tf.argmax(prediction, 1), tf.argmax(y, 1)) #gives the max of those matrixes
        accuracy = tf.reduce_mean(tf.cast(correct, 'float'))  #casts the corrext to a float
        print("Accuracy: ", accuracy.eval({x:mnist.test.images, y:mnist.test.labels}))

train_neural_network(x, [784,500,500,500,10])
}
public class Calculator extends JFrame{
    private JButton[] jba = new JButton[16];
    private String[] jbaChar = {"7", "8", "9", "*", "4", "5", "6","-", "1", "2", "3", "+", "0", ".", "=", "C"};
    private JTextArea text = new JTextArea();
    private Stack<String> stack = new Stack<>();
    private String n1 = new String();
    private String n2 = new String();
    private boolean second = false;
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


