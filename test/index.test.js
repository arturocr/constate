import React from "react";
import { mount } from "enzyme";
import { State, Provider } from "../src";

const wrap = (initialState, props, providerProps) =>
  mount(
    <Provider {...providerProps}>
      <State initialState={initialState} {...props}>
        {state => <div state={state} />}
      </State>
    </Provider>
  );

const getState = wrapper =>
  wrapper
    .update()
    .find("div")
    .prop("state");

const createTests = props => () => {
  test("initialState", () => {
    const initialState = { foo: "bar" };
    const wrapper = wrap(initialState, props);
    expect(getState(wrapper)).toEqual(initialState);
  });

  test("actions", () => {
    const initialState = { count: 0 };
    const actions = {
      increment: amount => state => ({ count: state.count + amount })
    };
    const wrapper = wrap(initialState, { actions, ...props });
    expect(getState(wrapper)).toEqual({
      count: 0,
      increment: expect.any(Function)
    });
    getState(wrapper).increment(2);
    expect(getState(wrapper)).toEqual(expect.objectContaining({ count: 2 }));
  });

  test("selectors", () => {
    const initialState = { count: 0 };
    const selectors = {
      getParity: () => state => (state.count % 2 === 0 ? "even" : "odd")
    };
    const wrapper = wrap(initialState, { selectors, ...props });
    expect(getState(wrapper)).toEqual({
      count: 0,
      getParity: expect.any(Function)
    });
    expect(getState(wrapper).getParity()).toBe("even");
  });
};

describe("local", createTests());

describe("global", () => {
  test("global initialState", () => {
    const initialState = { foo: { count: 0 } };
    const wrapper = wrap(undefined, { context: "foo" }, { initialState });
    expect(getState(wrapper)).toEqual({
      count: 0
    });
  });

  test("global initialState overrides local initialState", () => {
    const initialState = { foo: { count: 0 } };
    const wrapper = wrap(
      undefined,
      { context: "foo", initialState: { count: 1 } },
      { initialState }
    );
    expect(getState(wrapper)).toEqual({
      count: 0
    });
  });

  createTests({ context: "foo" })();
});
