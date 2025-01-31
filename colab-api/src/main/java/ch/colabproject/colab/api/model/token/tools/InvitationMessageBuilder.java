/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token.tools;

import ch.colabproject.colab.api.controller.token.TokenMessageBuilder;
import ch.colabproject.colab.api.model.token.InvitationToken;
import java.text.MessageFormat;

/**
 * To build the body of the message to send for an invitation token.
 *
 * @author sandra
 */
public final class InvitationMessageBuilder {

    /** Title */
    private static final String MESSAGE_HEAD_TITLE = "Invitation to a co.LAB project";

    /** Picture */
    private static final String MESSAGE_PICTURE = "<svg\n"
        + "            width=\"230\"\n"
        + "            height=\"245\"\n"
        + "            id=\"Layer_1\"\n"
        + "            xmlns=\"http://www.w3.org/2000/svg\"\n"
        + "            viewBox=\"0 0 384.66 396.62\"\n"
        + "          >\n"
        + "            <g>\n"
        + "              <path\n"
        + "                d=\"M384.66,208.42c0,103.94-82.83,188.2-185,188.2S14.66,312.37,14.66,208.42,97.49,20.21,199.66,20.21s185,84.26,185,188.21Z\"\n"
        + "                style=\"fill: #50bfd5\"\n"
        + "              />\n"
        + "              <g>\n"
        + "                <g>\n"
        + "                  <polygon\n"
        + "                    points=\"58.1 155.05 195.45 41.22 332.81 155.05 332.81 316.09 58.1 316.09 58.1 155.05\"\n"
        + "                    style=\"fill: #e05d11; isolation: isolate; opacity: 0.9\"\n"
        + "                  />\n"
        + "                  <path\n"
        + "                    d=\"M102.93,64.65h185.04c1.38,0,2.51,1.12,2.51,2.51V249.01c0,1.38-1.12,2.51-2.51,2.51H102.93c-1.38,0-2.51-1.12-2.51-2.51V67.15c0-1.38,1.12-2.51,2.51-2.51Z\"\n"
        + "                    style=\"fill: #f1f2f2\"\n"
        + "                  />\n"
        + "                  <polygon\n"
        + "                    points=\"58.1 155.05 172 235.57 58.1 316.09 58.1 155.05\"\n"
        + "                    style=\"fill: #ffe20f; isolation: isolate\"\n"
        + "                  />\n"
        + "                  <polygon\n"
        + "                    points=\"332.81 155.05 218.9 235.57 332.81 316.09 332.81 155.05\"\n"
        + "                    style=\"fill: #ffe20f; isolation: isolate\"\n"
        + "                  />\n"
        + "                </g>\n"
        + "                <polygon\n"
        + "                  points=\"219 235.57 172 235.57 172 235.5 58.1 316.09 332.81 316.09 219 235.57\"\n"
        + "                  style=\"fill: #d1b511; isolation: isolate\"\n"
        + "                />\n"
        + "              </g>\n"
        + "            </g>\n"
        + "            <g id=\"Calque_1\">\n"
        + "              <path\n"
        + "                d=\"M215.08,129.45c0,11.53-9.35,20.87-20.88,20.86-11.53,0-20.87-9.35-20.86-20.88,0-9,5.78-16.99,14.33-19.81,2.36,11.3,13.43,18.54,24.72,16.19,.76-.16,1.52-.36,2.26-.6,.29,1.4,.43,2.82,.43,4.24Z\"\n"
        + "                style=\"fill: #e05d11; isolation: isolate; opacity: 0.9\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M214.65,125.2c-7.08,2.33-14.87,.71-20.44-4.25,3.34-2.98,5.63-6.95,6.54-11.33,7.08,2.34,12.38,8.28,13.9,15.58Z\"\n"
        + "                style=\"fill: #589ebc; isolation: isolate; opacity: 0.9\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M228.98,105.38c0,9.01-5.78,17-14.33,19.82-2.35-11.29-13.4-18.54-24.69-16.19-.77,.16-1.54,.37-2.29,.61-2.34-11.29,4.91-22.34,16.2-24.68,11.29-2.34,22.34,4.91,24.68,16.2,.29,1.39,.44,2.81,.44,4.24Z\"\n"
        + "                style=\"fill: #50bfd5\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M200.75,109.62c-.91,4.38-3.2,8.35-6.54,11.33-3.34-2.98-5.63-6.95-6.54-11.33,4.25-1.4,8.84-1.4,13.09,0h0Z\"\n"
        + "                style=\"fill: #8f9aa8; isolation: isolate; opacity: 0.9\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M194.21,108.57c-2.22,0-4.43,.35-6.54,1.05,.91,4.38,3.2,8.35,6.55,11.33-8.58,7.65-21.74,6.9-29.39-1.69-7.65-8.58-6.9-21.74,1.69-29.39,8.58-7.65,21.74-6.9,29.39,1.69,4.38,4.91,6.18,11.61,4.85,18.06-2.11-.7-4.32-1.05-6.54-1.05Z\"\n"
        + "                style=\"fill: #ffe20f; isolation: isolate; opacity: 0.9\"\n"
        + "              />\n"
        + "            </g>\n"
        + "            <g>\n"
        + "              <path\n"
        + "                d=\"M154.84,186.11c1.13,.04,2.24-.34,3.12-1.05,.82-.67,1.32-1.66,1.36-2.72h1.71c-.04,.97-.37,1.9-.93,2.69-.58,.82-1.35,1.47-2.25,1.9-.94,.45-1.97,.69-3.02,.68-2.12,0-3.79-.74-5.03-2.2-1.24-1.47-1.85-3.45-1.85-5.93v-.54c-.03-1.45,.26-2.89,.83-4.22,.5-1.16,1.33-2.14,2.39-2.83,1.09-.68,2.36-1.03,3.64-1,1.77,0,3.22,.53,4.37,1.58s1.76,2.44,1.84,4.16h-1.71c-.05-2.38-2.02-4.27-4.4-4.22-.03,0-.06,0-.09,0-1.61,0-2.86,.58-3.75,1.74-.89,1.16-1.33,2.79-1.33,4.89v.52c0,2.05,.44,3.66,1.33,4.81s2.14,1.73,3.76,1.74Z\"\n"
        + "                style=\"fill: #333\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M163.61,179.01c-.02-1.44,.29-2.86,.9-4.16,1.13-2.44,3.59-3.99,6.28-3.93,2.14,0,3.88,.75,5.21,2.25s2,3.5,1.99,5.98v.37c.02,1.45-.29,2.89-.9,4.2-.55,1.19-1.43,2.19-2.54,2.88-1.13,.68-2.42,1.03-3.74,1-2.14,0-3.87-.75-5.21-2.26-1.34-1.51-2-3.5-2-5.98v-.36Zm1.79,.49c0,1.93,.5,3.51,1.5,4.75,1.77,2.16,4.96,2.48,7.13,.71,.26-.21,.5-.45,.71-.71,1-1.24,1.5-2.87,1.5-4.9v-.34c.01-1.16-.22-2.32-.69-3.38-.4-.96-1.07-1.78-1.92-2.38-.84-.56-1.82-.85-2.83-.83-1.52-.03-2.96,.66-3.88,1.87-1,1.25-1.51,2.88-1.51,4.89v.32Z\"\n"
        + "                style=\"fill: #333\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M179.3,185.2c-.02-.63,.23-1.24,.69-1.66,1-.85,2.48-.85,3.48,0,.46,.43,.72,1.04,.69,1.66,.02,.62-.23,1.22-.69,1.64-.48,.43-1.11,.66-1.76,.64-.64,.02-1.27-.2-1.74-.64-.46-.42-.71-1.02-.69-1.64Z\"\n"
        + "                style=\"fill: #8f9aa8; isolation: isolate; opacity: 0.9\"\n"
        + "              />\n"
        + "              <path d=\"M191.58,183.72h9.49v3.61h-13.96v-21.7h4.47v18.1Z\" style=\"fill: #333\" />\n"
        + "              <path\n"
        + "                d=\"M216.16,182.85h-7.84l-1.48,4.48h-4.75l8.07-21.69h4.14l8.12,21.69h-4.75l-1.5-4.48Zm-6.63-3.62h5.43l-2.73-8.12-2.7,8.12Z\"\n"
        + "                style=\"fill: #333\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M224.44,187.33v-21.7h7.6c2.63,0,4.63,.5,5.99,1.51,1.36,1.01,2.04,2.49,2.04,4.44,.02,1-.27,1.98-.83,2.81-.56,.82-1.35,1.44-2.28,1.78,1.05,.23,1.98,.83,2.63,1.68,.66,.89,1.01,1.99,.98,3.1,0,2.09-.67,3.66-2,4.74-1.33,1.07-3.23,1.62-5.69,1.64h-8.43Zm4.47-12.6h3.31c2.25-.04,3.38-.94,3.38-2.7,0-.98-.29-1.69-.86-2.12-.57-.43-1.47-.65-2.7-.65h-3.13v5.47Zm0,3.16v5.84h3.83c1.05,0,1.87-.25,2.47-.75,.6-.52,.92-1.29,.88-2.08,0-1.99-1.03-2.99-3.08-3.03h-4.1Z\"\n"
        + "                style=\"fill: #333\"\n"
        + "              />\n"
        + "            </g>\n"
        + "            <g>\n"
        + "              <g style=\"isolation: isolate; opacity: 0.9\">\n"
        + "                <path\n"
        + "                  d=\"M224.36,34.38c.63-5.76,1.58-12.01,2.6-17.73,.52-2.92,.54-5.98,1.73-8.75,1.2-2.89,2.64-5.57,4.92-7.89l.58,.16c.45,1.66,.57,3.23,.6,4.77,.01,3.03-.31,6.02-1.49,8.81-1.07,2.38-2.36,5.86-3.25,8.34-1.58,4.05-3.34,8.49-5.11,12.45l-.58-.16h0Z\"\n"
        + "                  style=\"fill: #8f9aa8\"\n"
        + "                />\n"
        + "              </g>\n"
        + "              <g style=\"isolation: isolate; opacity: 0.9\">\n"
        + "                <path\n"
        + "                  d=\"M311.63,58.85c3.09-4.2,6.64-8.65,9.99-12.65,3.28-4.56,6.88-8.34,12.49-10.2l.36,.35c-1.41,4.15-3.64,7.44-6.84,10.13-1.87,1.41-4.41,3.59-6.2,5.14-3.01,2.5-6.33,5.23-9.44,7.58l-.36-.35h0Z\"\n"
        + "                  style=\"fill: #8f9aa8\"\n"
        + "                />\n"
        + "              </g>\n"
        + "              <g style=\"isolation: isolate; opacity: 0.9\">\n"
        + "                <path\n"
        + "                  d=\"M99.35,37.49c-1.59-1.63-3.1-3.32-4.61-5l-2.23-2.55-2.17-2.59c-.72-.87-1.51-1.68-2.29-2.52-.76-.84-1.41-1.76-1.91-2.77-.99-2.04-1.8-4.2-1.92-6.83l.41-.28c2.4,1.08,4.11,2.63,5.65,4.3,.75,.84,1.37,1.78,1.87,2.8,.49,1.02,.96,2.06,1.5,3.05l1.61,2.97,1.55,3.02c1.01,2.03,2.02,4.05,2.96,6.13l-.41,.28Z\"\n"
        + "                  style=\"fill: #8f9aa8\"\n"
        + "                />\n"
        + "              </g>\n"
        + "              <g style=\"isolation: isolate; opacity: 0.9\">\n"
        + "                <path\n"
        + "                  d=\"M51.27,120.32c-4.37-.44-8.71-1.04-13.07-1.55l-6.51-.88-6.49-.97c-2.16-.33-4.35-.55-6.53-.81-2.18-.27-4.32-.7-6.42-1.33-2.1-.63-4.18-1.36-6.23-2.22-2.05-.88-4.07-1.84-6.03-3.14l.12-.59c2.32-.39,4.56-.44,6.79-.42,2.22,.05,4.42,.22,6.59,.5,2.17,.28,4.31,.75,6.4,1.39,2.09,.65,4.18,1.34,6.29,1.92l6.32,1.76,6.31,1.85c4.19,1.3,8.4,2.52,12.57,3.9l-.12,.59Z\"\n"
        + "                  style=\"fill: #8f9aa8\"\n"
        + "                />\n"
        + "              </g>\n"
        + "              <g style=\"isolation: isolate; opacity: 0.9\">\n"
        + "                <path\n"
        + "                  d=\"M334.28,128.7c3.6-1.01,7.22-1.89,10.83-2.85l5.43-1.34,5.44-1.26c1.82-.42,3.62-.92,5.42-1.4,1.81-.47,3.64-.79,5.49-.95,3.72-.3,7.48-.38,11.37,.36l.08,.49c-3.44,1.98-7.01,3.14-10.62,4.08-1.81,.46-3.64,.75-5.5,.91-1.86,.14-3.73,.26-5.58,.46l-5.56,.6-5.57,.52c-3.72,.29-7.43,.65-11.16,.87l-.08-.49Z\"\n"
        + "                  style=\"fill: #8f9aa8\"\n"
        + "                />\n"
        + "              </g>\n"
        + "            </g>\n"
        + "          </svg>";

    /** Header 1 */
    private static final String MESSAGE_HEADING = "Hi ! You've got an invitation.";

    /** Header 2 */
    private static final String MESSAGE_SUBHEADING = "{0} invites you to collaborate on {1}.";

    /** Information */
    private static final String MESSAGE_INFO = "<p>Click on the link below to start colabbing on the project.</p>";

    /** Label of the link */
    private static final String MESSAGE_LINK_LABEL = "Go to the project";

    private InvitationMessageBuilder() {
        // private constructor
    }

    /**
     * Build a HTML body to send a message for the invitation token
     *
     * @param token the invitation token
     * @param link  the link in order to consume the token
     *
     * @return the HTML body of the message to send
     */
    public static String build(InvitationToken token, String link) {
        String subHeading = MessageFormat.format(MESSAGE_SUBHEADING,
            token.getSender() != null
                ? token.getSender()
                : "Someone",
            token.getProject() != null
                ? "<i>" + token.getProject().getName() + "</i>"
                : "a co.LAB project");

        return new TokenMessageBuilder(token)
            .headTitle(MESSAGE_HEAD_TITLE)
            .picture(MESSAGE_PICTURE)
            .heading(MESSAGE_HEADING)
            .subheading(subHeading)
            .info(MESSAGE_INFO)
            .linkHref(link)
            .linkLabel(MESSAGE_LINK_LABEL)
            // let default footer
            .build();
    }

}
