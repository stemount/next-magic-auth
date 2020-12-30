import * as React from 'react';
import { useRouter } from 'next/router';

import Page from 'src/components/Page';
import Button from 'src/components/Button';
import LoginActivity from 'src/components/LoginActivity';
import { useAuth } from 'src/components/AuthProvider';
import { useModal } from 'src/components/Modal';
import graphql from 'src/client/graphql/queries';

import styles from 'styles/login.module.css';

LoginPage.requireAuth = true;

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { email } = router.query;

  console.debug('[LoginPage]', { auth });

  return (
    <Page className={styles.container}>
      <div className={styles.containerContent}>
        {auth.init ? <LoginForm {...{ email }} /> : null}
      </div>
    </Page>
  );
}

function CheckEmailModal({ dismiss, jwtToken, phrase }) {
  const auth = useAuth();
  const [getMe, me] = graphql.me();
  const approved = graphql.watchLoginRequest(jwtToken);

  React.useEffect(async () => {
    if (approved) {
      await auth.actions.completeLogin();
    }
  }, [approved]);

  React.useEffect(() => {
    if (auth.isLoggedIn) {
      getMe();
    }
  }, [auth.isLoggedIn]);

  React.useEffect(() => {
    if (me) {
      dismiss();
    }
  }, [me]);

  return (
    <div className={styles.checkEmailModal}>
      <div className={styles.checkEmailModalKeepThisTab}>
        Keep this tab open
      </div>
      <div>Use your phone to click the magic words in your email</div>
      <Button className={styles.magicWords}>{phrase}</Button>
    </div>
  );
}

function LoginForm(props) {
  const auth = useAuth();
  const modal = useModal();
  const [getMe, me] = graphql.me();
  const [email, set_email] = React.useState('');

  React.useEffect(() => {
    if (!email && props.email) {
      set_email(props.email);
    }
  }, [props.email]);

  React.useEffect(() => {
    if (auth.isLoggedIn) {
      getMe();
    }
  }, [auth.isLoggedIn]);

  async function handleSubmit(event) {
    event.preventDefault();

    const { elements } = event.target;
    const email = elements.email.value;

    // make the login API call
    const json = await auth.actions.login(email);
    if (json) {
      modal.open(CheckEmailModal, {
        props: json,
        disableBackgroundDismiss: true,
      });
    }
  }

  async function handleEmailInput(event) {
    set_email(event.target.value);
  }

  const buttonStyles = email ? styles.loginButtonEnabled : styles.loginButton;

  if (auth.isLoggedIn) {
    return (
      <>
        {!me ? null : <h1 className={styles.email}>{me.email}</h1>}

        <LoginActivity />

        <Button className={styles.button} onClick={auth.actions.logout}>
          Logout
        </Button>
      </>
    );
  }

  return (
    <>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <label className={styles.loginLabel} htmlFor="email">
          Email
        </label>
        <input
          className={styles.loginInput}
          name="email"
          type="email"
          placeholder="magic@gmail.com"
          value={email}
          onChange={handleEmailInput}
        />
        <Button className={buttonStyles}>Login</Button>
      </form>
    </>
  );
}
