package it.polimi.tiw.filters;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Servlet Filter checks if the user is logged out.
 */
@WebFilter({"/login.html", "/register.html", "/CheckLogin", "/register"})
public class LoggedOutChecker implements Filter {

    /**
     * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
     */
    @Override
    public void init(FilterConfig filterConfig) {

    }

    /**
     * Checks if the user is logged out otherwise redirects to the home page.
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpSession session = httpRequest.getSession();
        if (!session.isNew() && session.getAttribute("user") != null) {
            if (httpRequest.getMethod().equals("GET")) {
                ((HttpServletResponse) response).sendRedirect(((HttpServletRequest) request).getContextPath() + "/");
            } else {
                ((HttpServletResponse) response).setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("You are already logged in. Logout first.");
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    /**
     * @see Filter#destroy()
     */
    @Override
    public void destroy() {

    }
}
