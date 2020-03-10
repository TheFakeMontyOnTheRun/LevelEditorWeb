package LevelEditorWeb;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Date;
import java.util.StringTokenizer;

public class App implements Runnable {

    static final int PORT = 8080;

    enum Verb {GET, POST, PUT, DELETE, PATCH};

    private Socket connect;

    public App(Socket c) {
        connect = c;
    }

    public static void main(String[] args) {
        try {
            ServerSocket serverConnect = new ServerSocket(PORT);
            System.out.println("Server started.\nListening for connections on port : " + PORT + " ...\n");

            while (true) {
                App myServer = new App(serverConnect.accept());
                System.out.println("Connection open. (" + new Date() + ")");
                Thread thread = new Thread(myServer);
                thread.start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    String parseRequest(Verb verb, String path) {
	System.out.println("path: " + path);
	StringTokenizer parse = new StringTokenizer(path, "/", false );
	return "request result = " + parse.nextToken() + "->" + parse.nextToken();  
    }

    @Override
    public void run() {
        BufferedReader in = null; 
	PrintWriter out = null; 
	BufferedOutputStream dataOut = null;

        try {
            in = new BufferedReader(new InputStreamReader(connect.getInputStream()));
            out = new PrintWriter(connect.getOutputStream());
            dataOut = new BufferedOutputStream(connect.getOutputStream());
            String input = in.readLine();
            StringTokenizer parse = new StringTokenizer(input);
            String method = parse.nextToken().toUpperCase();
	    String data = "";
	    String head;
	    Verb verb = Verb.valueOf(method);
	    byte[] fileData = parseRequest(verb, parse.nextToken()).getBytes();

	    if (verb == Verb.POST) {		
		head = in.readLine();
		while( head != null && !head.trim().isEmpty() ) {
		    head = in.readLine();
		}

		try {
		    head = null;
		    if ( in.ready() ) {
			head = in.readLine();
		    }

		    while( head != null ) { 
			if (head != null && !head.trim().isEmpty()) {
			    data += head;
			}

			head = null;

			if ( in.ready() ) {
			    head = in.readLine();
			}
		    }
		} catch (Exception e) {
		}	      
		fileData = data.getBytes();
	    }
	    
	    
	    int fileLength = fileData.length;
	    String contentType = "text/plain";
	    
		    
	    out.println("HTTP/1.1 200 OK");
	    out.println("Access-Control-Allow-Origin: *");
	    out.println("Content-type: " + contentType);
	    out.println("Content-length: " + fileLength);
	    
	    out.println();
	    out.flush();
	    
	    dataOut.write(fileData, 0, fileLength);
	    dataOut.flush();
                
        } catch (IOException ioe) {
            System.err.println("Server error : " + ioe);
        } finally {
            try {
                in.close();
                out.close();
                dataOut.close();
                connect.close();
            } catch (Exception e) {
                System.err.println("Error closing stream : " + e.getMessage());
            }
        }
    }
}
