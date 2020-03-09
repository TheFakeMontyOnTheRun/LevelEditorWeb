package LevelEditorWeb;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Date;
import java.util.StringTokenizer;

public class App implements Runnable {

    static final int PORT = 8080;

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

    @Override
    public void run() {
        BufferedReader in = null; PrintWriter out = null; BufferedOutputStream dataOut = null;

        try {
            in = new BufferedReader(new InputStreamReader(connect.getInputStream()));
            out = new PrintWriter(connect.getOutputStream());
            dataOut = new BufferedOutputStream(connect.getOutputStream());
            String input = in.readLine();
            StringTokenizer parse = new StringTokenizer(input);
            String method = parse.nextToken().toUpperCase();

            if (!method.equals("GET")  &&  !method.equals("HEAD")) {
                System.out.println("FUCK YOU");
            } else {

                byte[] fileData = "yeah bro".getBytes();
                int fileLength = fileData.length;
                String contentType = "text/plain";

                if (method.equals("GET")) {

                    out.println("HTTP/1.1 200 OK");
                    out.println("Access-Control-Allow-Origin: *");
                    out.println("Content-type: " + contentType);
                    out.println("Content-length: " + fileLength);

                    out.println();
                    out.flush();

                    dataOut.write(fileData, 0, fileLength);
                    dataOut.flush();
                }
            }

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
