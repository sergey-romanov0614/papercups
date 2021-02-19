import React from 'react';
import {debounce} from 'lodash';
import {Box} from 'theme-ui';
import {TwitterPicker} from 'react-color';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {atomOneLight} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {ChatWidget} from '@papercups-io/chat-widget';
import * as API from '../../api';
import {User} from '../../types';
import {colors, Paragraph, Input, Switch, Text, Title} from '../common';
import {BASE_URL, FRONTEND_BASE_URL} from '../../config';
import logger from '../../logger';

type Props = {};
type State = {
  accountId: string | null;
  color: string;
  title: string;
  subtitle: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  currentUser: User | null;
  showAgentAvailability: boolean;
  agentAvailableText?: string;
  agentUnavailableText?: string;
  requireEmailUpfront: boolean;
};

class GettingStartedOverview extends React.Component<Props, State> {
  state: State = {
    accountId: null,
    currentUser: null,
    color: colors.primary,
    title: 'Welcome!',
    subtitle: 'Ask us anything in the chat window below 😊',
    greeting: '',
    newMessagePlaceholder: 'Start typing...',
    showAgentAvailability: false,
    agentAvailableText: `We're online right now!`,
    agentUnavailableText: `We're away at the moment.`,
    requireEmailUpfront: false,
  };

  async componentDidMount() {
    const currentUser = await API.me();
    const account = await API.fetchAccountInfo();
    const {
      id: accountId,
      company_name: company,
      widget_settings: widgetSettings,
    } = account;

    if (widgetSettings && widgetSettings.id) {
      const {
        color,
        title,
        subtitle,
        greeting,
        new_message_placeholder: newMessagePlaceholder,
        show_agent_availability: showAgentAvailability,
        agent_available_text: agentAvailableText,
        agent_unavailable_text: agentUnavailableText,
        require_email_upfront: requireEmailUpfront,
      } = widgetSettings;

      this.setState({
        accountId,
        currentUser,
        greeting,
        color: color || this.state.color,
        subtitle: subtitle || this.state.subtitle,
        title: title || `Welcome to ${company}`,
        newMessagePlaceholder: newMessagePlaceholder || 'Start typing...',
        showAgentAvailability:
          showAgentAvailability || this.state.showAgentAvailability,
        agentAvailableText: agentAvailableText || this.state.agentAvailableText,
        agentUnavailableText:
          agentUnavailableText || this.state.agentUnavailableText,
        requireEmailUpfront:
          requireEmailUpfront || this.state.requireEmailUpfront,
      });
    } else {
      this.setState({accountId, currentUser, title: `Welcome to ${company}`});
    }
  }

  debouncedUpdateWidgetSettings = debounce(
    () => this.updateWidgetSettings(),
    400
  );

  handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({title: e.target.value}, this.debouncedUpdateWidgetSettings);
  };

  handleChangeSubtitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      {subtitle: e.target.value},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeGreeting = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      {greeting: e.target.value},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeNewMessagePlaceholder = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState(
      {newMessagePlaceholder: e.target.value},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeRequireEmailUpfront = (isChecked: boolean) => {
    this.setState(
      {requireEmailUpfront: isChecked},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeShowingAgentAvailability = (isChecked: boolean) => {
    this.setState(
      {showAgentAvailability: isChecked},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeAgentAvailableText = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      {agentAvailableText: e.target.value},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeAgentUnavailableText = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState(
      {agentUnavailableText: e.target.value},
      this.debouncedUpdateWidgetSettings
    );
  };

  handleChangeColor = (color: any) => {
    this.setState({color: color.hex}, this.debouncedUpdateWidgetSettings);
  };

  updateWidgetSettings = async () => {
    const {
      color,
      title,
      subtitle,
      greeting,
      newMessagePlaceholder,
      showAgentAvailability,
      agentAvailableText,
      agentUnavailableText,
      requireEmailUpfront,
    } = this.state;

    API.updateWidgetSettings({
      color,
      title,
      subtitle,
      greeting,
      new_message_placeholder: newMessagePlaceholder,
      show_agent_availability: showAgentAvailability,
      agent_available_text: agentAvailableText,
      agent_unavailable_text: agentUnavailableText,
      require_email_upfront: requireEmailUpfront,
    })
      .then((res) => logger.debug('Updated widget settings:', res))
      .catch((err) => logger.error('Error updating widget settings:', err));
  };

  generateHtmlCode = () => {
    const {
      accountId,
      title,
      subtitle,
      color,
      greeting,
      newMessagePlaceholder,
      showAgentAvailability,
      agentAvailableText,
      agentUnavailableText,
      requireEmailUpfront,
    } = this.state;

    return `
<script>
  window.Papercups = {
    config: {
      accountId: "${accountId}",
      title: "${title}",
      subtitle: "${subtitle}",
      primaryColor: "${color}",
      greeting: "${greeting || ''}",
      newMessagePlaceholder: "${newMessagePlaceholder || ''}",
      showAgentAvailability: ${showAgentAvailability},
      agentAvailableText: "${agentAvailableText}",
      agentUnavailableText: "${agentUnavailableText}",
      requireEmailUpfront: ${requireEmailUpfront},
      baseUrl: "${BASE_URL}"
    },
  };
</script>
<script
  type="text/javascript"
  async
  defer
  src="${FRONTEND_BASE_URL}/widget.js"
></script>
  `.trim();
  };

  generateReactCode = () => {
    const {
      accountId,
      title,
      subtitle,
      color,
      greeting,
      newMessagePlaceholder,
      showAgentAvailability,
      agentAvailableText,
      agentUnavailableText,
      requireEmailUpfront,
    } = this.state;

    return `
import React from "react";
import {ChatWidget} from "@papercups-io/chat-widget";

const ExamplePage = () => {
  return (
    <>
      {/*
        Put <ChatWidget /> at the bottom of whatever pages you would
        like to render the widget on, or in your root/router component
        if you would like it to render on every page
      */}
      <ChatWidget
        accountId="${accountId}"
        title="${title}"
        subtitle="${subtitle}"
        primaryColor="${color}"
        greeting="${greeting || ''}"
        newMessagePlaceholder="${newMessagePlaceholder}"
        showAgentAvailability={${showAgentAvailability}}
        agentAvailableText="${agentAvailableText}"
        agentUnavailableText="${agentUnavailableText}"
        requireEmailUpfront={${requireEmailUpfront}}
        baseUrl="${BASE_URL}"
      />
    </>
  );
};
  `.trim();
  };

  getUserMetadata = () => {
    const {currentUser} = this.state;

    if (!currentUser) {
      return {};
    }

    const {id, email} = currentUser;

    // TODO: include name if available
    return {
      email: email,
      external_id: [id, email].join('|'),
    };
  };

  render() {
    const {
      accountId,
      color,
      title,
      subtitle,
      greeting,
      newMessagePlaceholder,
      showAgentAvailability,
      agentAvailableText,
      agentUnavailableText,
      requireEmailUpfront,
    } = this.state;

    if (!accountId) {
      return null; // TODO: better loading state
    }

    const customer = this.getUserMetadata();

    return (
      <Box
        p={4}
        sx={{
          maxWidth: 720,
        }}
      >
        <Box mb={4}>
          <Title>Getting Started</Title>
          <Paragraph>
            <Text>
              Before you can start chatting with your customers, you'll need to
              install our chat component on your website.
            </Text>
          </Paragraph>
        </Box>

        <Box mb={4}>
          <Title level={3}>Customize your widget</Title>
          <Paragraph>
            <Text>
              Customize your widget with the form and color picker. It will
              update the preview to the right as well as the code below so you
              can easily copy and paste it into your website looking just the
              way you like!
            </Text>
          </Paragraph>

          <Box mb={3}>
            <label htmlFor="title">Update the title:</label>
            <Input
              id="title"
              type="text"
              placeholder="Welcome!"
              value={title}
              onChange={this.handleChangeTitle}
              onBlur={this.updateWidgetSettings}
            />
          </Box>

          <Box mb={3}>
            <label htmlFor="subtitle">Update the subtitle:</label>
            <Input
              id="subtitle"
              type="text"
              placeholder="How can we help you?"
              value={subtitle}
              onChange={this.handleChangeSubtitle}
              onBlur={this.updateWidgetSettings}
            />
          </Box>

          <Box mb={3}>
            <label htmlFor="greeting">
              Set a greeting (requires page refresh to view):
            </label>
            <Input
              id="greeting"
              type="text"
              placeholder="Hello! Any questions?"
              value={greeting}
              onChange={this.handleChangeGreeting}
              onBlur={this.updateWidgetSettings}
            />
          </Box>

          <Box mb={3}>
            <label htmlFor="new_message_placeholder">
              Update the new message placeholder text:
            </label>
            <Input
              id="new_message_placeholder"
              type="text"
              placeholder="Start typing..."
              value={newMessagePlaceholder}
              onChange={this.handleChangeNewMessagePlaceholder}
              onBlur={this.updateWidgetSettings}
            />
          </Box>

          <Box mb={4}>
            <Paragraph>Try changing the color:</Paragraph>
            <TwitterPicker
              color={this.state.color}
              onChangeComplete={this.handleChangeColor}
            />
          </Box>

          <Box mb={1}>
            <label htmlFor="require_email_upfront">
              Require unidentified customers to provide their email upfront?
            </label>
          </Box>
          <Box mb={3}>
            <Switch
              checked={requireEmailUpfront}
              onChange={this.handleChangeRequireEmailUpfront}
            />
          </Box>

          <Box mb={1}>
            <label htmlFor="show_agent_availability">
              Show agent availability?
            </label>
          </Box>
          <Box mb={3}>
            <Switch
              checked={showAgentAvailability}
              onChange={this.handleChangeShowingAgentAvailability}
            />
          </Box>

          <Box mb={3}>
            <label htmlFor="agent_available_text">
              Set the text displayed when agents are available:
            </label>
            <Input
              id="agent_available_text"
              type="text"
              placeholder="We're online right now!"
              value={agentAvailableText}
              onChange={this.handleChangeAgentAvailableText}
              onBlur={this.updateWidgetSettings}
            />
          </Box>

          <Box mb={3}>
            <label htmlFor="agent_unavailable_text">
              Set the text displayed when agents are unavailable:
            </label>
            <Input
              id="agent_unavailable_text"
              type="text"
              placeholder="We're away at the moment."
              value={agentUnavailableText}
              onChange={this.handleChangeAgentUnavailableText}
              onBlur={this.updateWidgetSettings}
            />
          </Box>

          <ChatWidget
            title={title || 'Welcome!'}
            subtitle={subtitle}
            primaryColor={color}
            greeting={greeting}
            showAgentAvailability={showAgentAvailability}
            agentAvailableText={agentAvailableText}
            agentUnavailableText={agentUnavailableText}
            requireEmailUpfront={requireEmailUpfront}
            newMessagePlaceholder={newMessagePlaceholder}
            accountId={accountId}
            customer={customer}
            baseUrl={BASE_URL}
            defaultIsOpen
          />
        </Box>

        <Box mb={4}>
          <Title level={3}>Installing the widget</Title>
          <Paragraph>
            <Text>
              Before you can start receiving messages here in your dashboard,
              you'll need to install the chat widget into your website.{' '}
              <span role="img" aria-label=":)">
                😊
              </span>
            </Text>
          </Paragraph>
        </Box>

        <Box mb={4}>
          <Title level={3}>Usage in HTML</Title>
          <Paragraph>
            <Text>
              Paste the code below between your <Text code>{'<head>'}</Text> and{' '}
              <Text code>{'</head>'}</Text> tags:
            </Text>
          </Paragraph>

          <SyntaxHighlighter language="html" style={atomOneLight}>
            {this.generateHtmlCode()}
          </SyntaxHighlighter>
        </Box>

        <Box mb={4}>
          <Title level={3}>Usage in React</Title>
          <Paragraph>
            <Text>
              First, install the <Text code>@papercups-io/chat-widget</Text>{' '}
              package:
            </Text>
          </Paragraph>

          <Paragraph>
            <pre
              style={{
                backgroundColor: '#f6f8fa',
                color: colors.black,
                fontSize: 12,
              }}
            >
              <Box p={3}>npm install --save @papercups-io/chat-widget</Box>
            </pre>
          </Paragraph>

          <Paragraph>
            <Text>
              Your account token has been prefilled in the code below. Simply
              copy and paste the code into whichever pages you would like to
              display the chat widget!
            </Text>
          </Paragraph>

          <SyntaxHighlighter language="typescript" style={atomOneLight}>
            {this.generateReactCode()}
          </SyntaxHighlighter>
        </Box>

        <Title level={3}>Learn more</Title>
        <Paragraph>
          <Text>
            See the code and star our{' '}
            <a
              href="https://github.com/papercups-io/chat-widget"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github repo
            </a>
            .
          </Text>
        </Paragraph>
      </Box>
    );
  }
}

export default GettingStartedOverview;
