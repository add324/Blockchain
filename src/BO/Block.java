package BO;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.xml.bind.DatatypeConverter;

import org.json.simple.JSONObject;

public class Block {

	private String blockId;
	private String blockData;
	private String parentId;
	private long nonce;
	private String blockHash;
	private int difficulty;
	private long miningTime;
	private boolean isMiningSuccessful;
	private long timeOut;
	public Block() {
	}

	public Block(String blockId, String blockData, String parentId, long nonce, String blockHash, int difficulty, long timeOut) {
		this.blockId = blockId;
		this.blockData = blockData;
		this.parentId = parentId;
		this.nonce = nonce;
		this.blockHash = blockHash;
		this.difficulty = difficulty;
		this.timeOut = timeOut;
	}

	public String getBlockId() {
		return blockId;
	}

	public void setBlockId(String blockId) {
		this.blockId = blockId;
	}

	public String getBlockData() {
		return blockData;
	}

	public void setBlockData(String blockData) {
		this.blockData = blockData;
	}

	public String getParentId() {
		return parentId;
	}

	public void setParentId(String parentId) {
		this.parentId = parentId;
	}

	public long getNonce() {
		return nonce;
	}

	public void setNonce(int nonce) {
		this.nonce = nonce;
	}

	public String getBlockHash() {
		return blockHash;
	}

	public void setBlockHash(String blockHash) {
		this.blockHash = blockHash;
	}
	
	public int getDifficulty() {
		return difficulty;
	}

	public void setDifficulty(int difficulty) {
		this.difficulty = difficulty;
	}
	
	public boolean isMiningSuccessful() {
		return isMiningSuccessful;
	}

	public void setMiningSuccessful(boolean isMiningSuccessful) {
		this.isMiningSuccessful = isMiningSuccessful;
	}

	public JSONObject mineBlock() {
		String initialValue = "";
		for(int index = 0; index<this.difficulty; index++) {
			initialValue+="0";
		}
		 
		long startTime = System.currentTimeMillis();
		try {
			
			while(!this.blockHash.startsWith(initialValue) && System.currentTimeMillis() - startTime < timeOut) {
				++this.nonce;
				this.setBlockHash(calculateHash());
			}
			
		} catch (NoSuchAlgorithmException e) {
			this.setMiningSuccessful(false);
		}
		
		this.miningTime = System.currentTimeMillis() - startTime;
		
		if(this.miningTime >= timeOut) {
			this.setMiningSuccessful(false);
		}
		else {
			this.setMiningSuccessful(true);
		}
		
		JSONObject miningResult = new JSONObject();
		miningResult.put("hash", this.blockHash);
		miningResult.put("status", this.isMiningSuccessful());
		miningResult.put("time", this.miningTime);
		miningResult.put("nonce", this.nonce);
		
		return miningResult;
	}
	
	public String calculateHash() throws NoSuchAlgorithmException {
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        String data = this.blockId +""+ this.blockData + "" + this.nonce +""+ this.parentId;
        messageDigest.update(data.getBytes());
		return DatatypeConverter.printHexBinary(messageDigest.digest()).toLowerCase();
	}

	@Override
	public String toString() {
		return "blockHash: " + blockHash + ",\t\t miningTime: " + miningTime
				+ "ms,\t\t SUCCESSFUL: " + isMiningSuccessful+ " Nonce: "+nonce;
	}
}