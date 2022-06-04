package it.polimi.tiw.utils;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public abstract class InputValidator {

    /**
     * Check if a string is an integer
     * @return true if the string represents an integer, false otherwise
     */
    public static boolean isInt(String toCheck, HttpServletResponse response) throws IOException {
        if(!toCheck.matches("-?\\d+")){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return false;
        }
        return true;
    }
}
