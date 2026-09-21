import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hasCoordinates, RegionMap } from "../../src/components/RegionMap";
const region = {id:1,nome:'Reserva <b>Una</b>',latitude:-15.18,longitude:-39.05,tipoEcossistema:null,descricao:null};
const species = {id:1,nomePopular:'Onça-pintada',nomeCientifico:'Panthera onca',familia:null,classe:null,statusConservacao:null};
describe('mapa com Leaflet',()=>{
 it('aceita coordenadas zero e rejeita ausências e posições inválidas',()=>{
  expect(hasCoordinates({...region,latitude:0,longitude:0})).toBe(true);
  expect(hasCoordinates({...region,latitude:null})).toBe(false);
  expect(hasCoordinates({...region,longitude:181})).toBe(false);
  expect(hasCoordinates({...region,latitude:Number.NaN})).toBe(false);
 });
 it('cria marcadores para regiões válidas, com fichas corretas e texto seguro no popup',()=>{
  const {container,unmount}=render(<RegionMap regions={[region,{...region,id:2,latitude:null}]} species={[species]} observations={[{id:1,especieId:1,regiaoId:1,data:'2026-09-09',descricao:null,fotoUrl:null}]}/>);
  expect(container.querySelectorAll('.region-marker')).toHaveLength(1);
  fireEvent.click(container.querySelector('.region-marker')!);
  expect(screen.getByText('Reserva <b>Una</b>')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Onça-pintada'})).toHaveAttribute('href','#/especies/1');
  expect(screen.getByText(/1 observações • Localização aproximada/)).toBeInTheDocument();
  unmount();
 });
});
