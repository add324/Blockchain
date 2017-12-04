package servlets;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import BO.Block;

/**
 * Servlet implementation class MineBlockServlet
 */
public class MineBlockServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html");
		String url = request.getRequestURL().toString();
		
		if(url.contains("home")) {
			response.sendRedirect("/WebContent/BlockChain.html");
		}
		else {
			
			JSONParser parser = new JSONParser();

	        try {
	        		
	        		JSONObject jsonObject = (JSONObject) parser.parse(request.getReader());

	            String blockId = (String) jsonObject.get("block");
	            String parentHash = String.valueOf(jsonObject.get("parent"));
	            String blockData = (String) jsonObject.get("data");
	            String blockHash = (String) jsonObject.get("hash");
	            int difficulty = Integer.valueOf(String.valueOf(jsonObject.get("difficulty")));
	            long nonce = Long.valueOf(String.valueOf(jsonObject.get("nonce")));
	            long timeout = Long.valueOf(String.valueOf(jsonObject.get("timeout")));
	            
	            Block block = new Block(blockId, blockData, parentHash, nonce, blockHash, difficulty, timeout);
				JSONObject miningResult = block.mineBlock();
				
				response.setContentType("application/json");
				response.setCharacterEncoding("UTF-8");
				response.getWriter().write(miningResult.toJSONString());
	            
	        } catch (IOException e) {
	            e.printStackTrace();
	        } 
	            catch (ParseException e) {
	            e.printStackTrace();
	        }
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}
}
