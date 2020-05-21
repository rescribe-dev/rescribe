/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sql;
/**
 *
 * @author mycicle
 */
import java.io.FileReader;
import java.io.Reader;
import java.sql.*;
import java.util.Properties;

public class Sql {

    public static void main(String args[]) throws Exception{
        Properties p = new Properties();
        Reader r = new FileReader("dbconfig.conf");
        p.load(r);
        r.close();
        
        String conn = p.getProperty("conn");
        String userid = p.getProperty("userid");
        String password = p.getProperty("password");
        
            Class.forName(p.getProperty("driver", "com.mysql.jdbc.Driver"));
            Connection con = DriverManager.getConnection(
                    conn, userid, password);
  
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("select * from students");
            while (rs.next()) {
                System.out.println(rs.getString("firstname") + "  " + rs.getString("lastname") + "  " + rs.getInt("id"));
            }
            stmt.close();
            
            stmt = con.createStatement();
            for(int id = 3; id < 100003; id++){
                stmt.execute("insert into students values('michael', 'digregorio'," +  id + ")"); //semicolon
            }
            stmt.close();
            ResultSet rs2 = stmt.executeQuery("select * from students");
            while (rs2.next()) {
                System.out.println(rs.getString("firstname") + "  " + rs.getString("lastname") + "  " + rs.getInt("id"));
            }
            con.close(); //takes time - only if you dont want to do anything
    }
}
